import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceDto, UpdateMaintenanceDto } from './dto/maintenance.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';

@ApiTags('Maintenance')
@ApiBearerAuth()
@Controller({ path: 'maintenance', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'List all maintenance logs' })
  async findAll(@CurrentUser() user: User) {
    return this.maintenanceService.findAll(user.companyId);
  }

  @Get('overdue')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'List overdue maintenance items' })
  async findOverdue(@CurrentUser() user: User) {
    return this.maintenanceService.findOverdue(user.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get maintenance log by ID' })
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.maintenanceService.findOne(id, user.companyId);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Schedule a maintenance task' })
  async create(@Body() dto: CreateMaintenanceDto, @CurrentUser() user: User) {
    return this.maintenanceService.create(dto, user.companyId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Update maintenance log (mark complete, add notes)' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMaintenanceDto,
    @CurrentUser() user: User,
  ) {
    return this.maintenanceService.update(id, user.companyId, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a maintenance log' })
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.maintenanceService.remove(id, user.companyId);
  }
}
