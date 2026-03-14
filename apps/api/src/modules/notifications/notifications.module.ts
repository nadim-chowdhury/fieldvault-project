import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { Notification } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';
import { WhatsappService } from './services/whatsapp.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, User]),
    AuthModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, WhatsappService],
  exports: [NotificationsService, WhatsappService],
})
export class NotificationsModule {}
