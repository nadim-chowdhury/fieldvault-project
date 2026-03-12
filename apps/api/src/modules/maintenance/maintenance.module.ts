import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceController } from './maintenance.controller';
import { MaintenanceLog } from './entities/maintenance-log.entity';
import { Asset } from '../assets/entities/asset.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MaintenanceLog, Asset])],
  controllers: [MaintenanceController],
  providers: [MaintenanceService],
  exports: [MaintenanceService],
})
export class MaintenanceModule {}
