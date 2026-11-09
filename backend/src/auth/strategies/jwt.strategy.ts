import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Request } from 'express';
import {
  assertSessionActive,
  assertTokenNotRevoked,
  loadSessionUser,
} from '../../common/auth/session-policy';

export interface JwtPayload {
  sub: string;
  email: string;
  organizationId: string;
  roleId: string;
  /** Session (ligne refresh_tokens) à laquelle le jeton est rattaché */
  sid?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      // Extraire le token depuis les cookies en priorité, fallback sur header Authorization
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          // Priorité 1: cookie httpOnly (nouveau système sécurisé)
          if (request?.cookies?.['accessToken']) {
            return request.cookies['accessToken'];
          }
          // Priorité 2: header Authorization (ancien système, rétrocompatibilité)
          return ExtractJwt.fromAuthHeaderAsBearerToken()(request);
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') as string,
      passReqToCallback: false,
    });
  }

  async validate(payload: JwtPayload & { scope?: string }) {
    // Un jeton WebSocket (scope limité) n'ouvre pas l'API HTTP
    if (payload.scope === 'websocket') throw new UnauthorizedException();
    // Compte supprimé/désactivé, organisation supprimée/suspendue/rejetée : la session tombe immédiatement
    const user = await loadSessionUser(this.prisma, payload.sub);
    // Jeton émis avant une révocation globale (mot de passe réinitialisé…) : refusé
    assertTokenNotRevoked(user, payload);
    // Session fermée (déconnexion de cet appareil, rotation) : refusé
    await assertSessionActive(this.prisma, payload);
    return { ...user, sessionId: payload.sid ?? null };
  }
}
