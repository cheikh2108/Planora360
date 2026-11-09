import request from 'supertest';

/**
 * Client HTTP qui se comporte comme le frontend :
 * cookies httpOnly conservés entre requêtes + header x-csrf-token sur les requêtes mutantes.
 */
export class ApiClient {
  readonly agent: ReturnType<typeof request.agent>;
  csrf = '';
  user: any;
  /** Cookies reçus au login (accessToken, refreshToken, csrf-token). */
  cookies: Record<string, string> = {};

  constructor(http: any) {
    this.agent = request.agent(http);
  }

  static async loggedIn(
    http: any,
    email: string,
    password: string,
  ): Promise<ApiClient> {
    const client = new ApiClient(http);
    await client.login(email, password);
    return client;
  }

  async login(email: string, password: string) {
    const res = await this.agent
      .post('/api/auth/login')
      .send({ email, password });
    if (res.status !== 200) {
      throw new Error(
        `Login impossible pour ${email} : ${res.status} ${JSON.stringify(res.body)}`,
      );
    }
    this.csrf = res.body.csrfToken;
    this.user = res.body.user;
    for (const c of ([] as string[]).concat(res.headers['set-cookie'] ?? [])) {
      const [pair] = c.split(';');
      const idx = pair.indexOf('=');
      this.cookies[pair.slice(0, idx)] = pair.slice(idx + 1);
    }
    return res;
  }

  get(url: string) {
    return this.agent.get(url);
  }

  post(url: string, body?: any) {
    return this.agent.post(url).set('x-csrf-token', this.csrf).send(body);
  }

  patch(url: string, body?: any) {
    return this.agent.patch(url).set('x-csrf-token', this.csrf).send(body);
  }

  put(url: string, body?: any) {
    return this.agent.put(url).set('x-csrf-token', this.csrf).send(body);
  }

  delete(url: string) {
    return this.agent.delete(url).set('x-csrf-token', this.csrf);
  }

  upload(
    url: string,
    field: string,
    content: Buffer,
    filename: string,
    contentType: string,
    extra: Record<string, string> = {},
  ) {
    let req = this.agent
      .post(url)
      .set('x-csrf-token', this.csrf)
      .attach(field, content, { filename, contentType });
    for (const [k, v] of Object.entries(extra)) req = req.field(k, v);
    return req;
  }
}

/** Renvoie le tableau de résultats, que l'API réponde un tableau ou un objet paginé. */
export function items(body: any): any[] {
  if (Array.isArray(body)) return body;
  for (const key of ['data', 'items', 'results', 'rows']) {
    if (Array.isArray(body?.[key])) return body[key];
  }
  const firstArray = body && Object.values(body).find((v) => Array.isArray(v));
  return (firstArray as any[]) ?? [];
}
