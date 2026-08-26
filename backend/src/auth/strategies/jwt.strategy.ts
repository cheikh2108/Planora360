import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Request } from 'express';

export interface JwtPayload {
  sub: string;
  email: string;
  organizationId: string;
  roleId: string;
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

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { role: true, organization: true },
    });

    if (!user || !user.isActive) throw new UnauthorizedException();

    return user;
  }
}
