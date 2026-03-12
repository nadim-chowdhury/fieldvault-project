import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Asset } from '../assets/entities/asset.entity';
import { Assignment } from '../assignments/entities/assignment.entity';
import { MaintenanceLog } from '../maintenance/entities/maintenance-log.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Asset, Assignment, MaintenanceLog, User])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
