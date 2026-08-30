import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MulterModule } from '@nestjs/platform-express';
import { MessagerieService } from './messagerie.service';
import { MessagerieController } from './messagerie.controller';
import { MessagerieGateway } from './messagerie.gateway';
import { UploadController } from './upload.controller';
import { PrismaModule } from '../common/prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { memoryStorage } from 'multer';

@Module({
  imports: [
    PrismaModule,
    StorageModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
    MulterModule.register({
      storage: memoryStorage(), // Stockage en mémoire, pas sur disque
    }),
  ],
  controllers: [MessagerieController, UploadController],
  providers: [MessagerieService, MessagerieGateway],
  exports: [MessagerieService, MessagerieGateway],
})
export class MessagerieModule {}
