import request from 'supertest';
import { NotificationsService } from '../src/notifications/notifications.service';
import { ApiClient } from './helpers/api-client';
import { closeTestApp, createTestApp, TestContext } from './helpers/app';
import { createTenant, createUser, login, Tenant } from './helpers/fixtures';

/** Mot de passe oublié : demande, lien à usage unique, réinitialisation, fermeture des sessions. */
describe('Mot de passe oublié', () => {
  let ctx: TestContext;
  let tenant: Tenant;
  let resetLink: jest.SpyInstance;
  let changedNotice: jest.SpyInstance;

  beforeAll(async () => {
    ctx = await createTestApp();
    tenant = await createTenant(ctx.prisma, 'pwdreset');
    const notifications = ctx.app.get(NotificationsService);
    resetLink = jest.spyOn(notifications, 'sendPasswordResetLink').mockResolvedValue(undefined);
    changedNotice = jest.spyOn(notifications, 'sendPasswordChangedNotice').mockResolvedValue(undefined);
  });
  afterAll(() => closeTestApp(ctx));
  beforeEach(() => {
    resetLink.mockClear();
    changedNotice.mockClear();
  });

  const forgot = (email: string) => request(ctx.http).post('/api/auth/forgot-password').send({ email });
  const reset = (token: string, newPassword: string) =>
    request(ctx.http).post('/api/auth/reset-password').send({ token, newPassword });
  const tokenFromLastEmail = () => {
    const url: string = resetLink.mock.calls.at(-1)![0].resetUrl;
    expect(url).toMatch(/^http:\/\/localhost:3001\/auth\/reset-password\?token=/);
    return new URL(url).searchParams.get('token')!;
  };

  it('répond le même message que le compte existe ou non, et n\'envoie un e-mail qu\'au compte existant', async () => {
    const user = await createUser(ctx.prisma, tenant.org.id, 'Coordinateur', 'pwd1');
    const known = await forgot(user.email.toUpperCase());
    const unknown = await forgot('personne@exemple.invalid');
    expect(known.status).toBe(200);
    expect(unknown.status).toBe(200);
    expect(known.body).toEqual(unknown.body);
    expect(resetLink).toHaveBeenCalledTimes(1);
    expect(resetLink.mock.calls[0][0]).toMatchObject({ email: user.email, expiresInMinutes: 30 });
  });

  it('ne stocke que le hachage du jeton', async () => {
    const user = await createUser(ctx.prisma, tenant.org.id, 'Coordinateur', 'pwd2');
    await forgot(user.email);
    const token = tokenFromLastEmail();
    const rows = await ctx.prisma.passwordResetToken.findMany({ where: { userId: user.id } });
    expect(rows).toHaveLength(1);
    expect(rows[0].tokenHash).not.toContain(token);
    expect(rows[0].tokenHash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('réinitialise le mot de passe, ferme toutes les sessions et refuse un second usage du lien', async () => {
    const user = await createUser(ctx.prisma, tenant.org.id, 'Coordinateur', 'pwd3');
    const session = await login(ctx.http, user);
    const access = session.cookies.accessToken;

    await forgot(user.email);
    const token = tokenFromLastEmail();
    expect((await request(ctx.http).post('/api/auth/reset-password/check').send({ token })).body).toEqual({ valid: true });

    const res = await reset(token, 'Nouveau1Secret');
    expect(res.status).toBe(200);
    expect(changedNotice).toHaveBeenCalledWith({ email: user.email, firstName: expect.any(String) });

    // Ancienne session fermée, ancien mot de passe refusé, nouveau accepté
    const me = await request(ctx.http).get('/api/auth/me').set('Cookie', `accessToken=${access}`);
    expect(me.status).toBe(401);
    await expect(ApiClient.loggedIn(ctx.http, user.email, user.password)).rejects.toBeDefined();
    await expect(ApiClient.loggedIn(ctx.http, user.email, 'Nouveau1Secret')).resolves.toBeDefined();

    // Lien déjà utilisé
    expect((await reset(token, 'Encore1Autre')).status).toBe(400);
    expect((await request(ctx.http).post('/api/auth/reset-password/check').send({ token })).body).toEqual({ valid: false });
  });

  it('refuse un lien expiré, inventé, ou un mot de passe trop faible', async () => {
    const user = await createUser(ctx.prisma, tenant.org.id, 'Coordinateur', 'pwd4');
    await forgot(user.email);
    const token = tokenFromLastEmail();

    expect((await reset(token, 'faible')).status).toBe(400);
    expect((await reset(token, 'sansmajuscule1')).status).toBe(400);
    expect((await reset('x'.repeat(43), 'Valide1Secret')).status).toBe(400);

    await ctx.prisma.passwordResetToken.updateMany({ where: { userId: user.id }, data: { expiresAt: new Date(Date.now() - 1000) } });
    const expired = await reset(token, 'Valide1Secret');
    expect(expired.status).toBe(400);
    expect(expired.body.message).toMatch(/invalide ou a expiré/);
  });

  it('une nouvelle demande annule le lien précédent ; pas de second e-mail avant 2 minutes', async () => {
    const user = await createUser(ctx.prisma, tenant.org.id, 'Coordinateur', 'pwd5');
    await forgot(user.email);
    const first = tokenFromLastEmail();

    await forgot(user.email);
    expect(resetLink).toHaveBeenCalledTimes(1); // délai anti-spam

    // On simule une demande plus ancienne pour passer le délai
    await ctx.prisma.passwordResetToken.updateMany({ where: { userId: user.id }, data: { createdAt: new Date(Date.now() - 5 * 60 * 1000) } });
    await forgot(user.email);
    expect(resetLink).toHaveBeenCalledTimes(2);
    const second = tokenFromLastEmail();

    expect((await reset(first, 'Valide1Secret')).status).toBe(400);
    expect((await reset(second, 'Valide1Secret')).status).toBe(200);
  });

  it('n\'envoie rien pour un compte désactivé ou supprimé', async () => {
    const inactive = await createUser(ctx.prisma, tenant.org.id, 'Coordinateur', 'pwd6');
    await ctx.prisma.user.update({ where: { id: inactive.id }, data: { isActive: false } });
    const deleted = await createUser(ctx.prisma, tenant.org.id, 'Coordinateur', 'pwd7');
    await ctx.prisma.user.update({ where: { id: deleted.id }, data: { deletedAt: new Date() } });

    expect((await forgot(inactive.email)).status).toBe(200);
    expect((await forgot(deleted.email)).status).toBe(200);
    expect(resetLink).not.toHaveBeenCalled();
  });

  it('refuse une adresse mal formée', async () => {
    expect((await forgot('pas-une-adresse')).status).toBe(400);
  });
});
