import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { SecurityEventsModule } from '../security-events/security-events.module';
// import { DexpayModule } from '../dexpay/dexpay.module'; // Désactivé - intégration paiement à faire
import { NotificationsModule } from '../notifications/notifications.module';
import { PasswordResetService } from './password-reset.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN') },
      }),
    }),
    SecurityEventsModule,
    // DexpayModule, // Désactivé
    NotificationsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, PasswordResetService],
  exports: [JwtModule],
})
export class AuthModule {}
