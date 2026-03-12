import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Asset } from '../assets/entities/asset.entity';
import { MaintenanceLog } from '../maintenance/entities/maintenance-log.entity';
import { Assignment } from '../assignments/entities/assignment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Asset, MaintenanceLog, Assignment])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
