import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MessagerieService } from './messagerie.service';
import { MessagerieController } from './messagerie.controller';
import { MessagerieGateway } from './messagerie.gateway';
import { PrismaModule } from '../common/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [MessagerieController],
  providers: [MessagerieService, MessagerieGateway],
  exports: [MessagerieService, MessagerieGateway],
})
export class MessagerieModule {}
