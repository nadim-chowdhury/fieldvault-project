import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AssignmentsService } from './assignments.service';
import { CheckoutDto, CheckinDto } from './dto/assignment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Assignments')
@ApiBearerAuth()
@Controller({ path: 'assignments', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Get('active')
  @ApiOperation({ summary: 'List all active (checked-out) assignments' })
  async findAllActive(@CurrentUser() user: User) {
    return this.assignmentsService.findAllActive(user.companyId);
  }

  @Get('asset/:assetId')
  @ApiOperation({ summary: 'Get assignment history for an asset' })
  async findByAsset(@Param('assetId') assetId: string, @CurrentUser() user: User) {
    return this.assignmentsService.findByAsset(assetId, user.companyId);
  }

  @Post('checkout')
  @ApiOperation({ summary: 'Check out an asset to current user' })
  async checkout(@Body() dto: CheckoutDto, @CurrentUser() user: User) {
    return this.assignmentsService.checkout(dto, user.id, user.companyId);
  }

  @Post(':id/checkin')
  @ApiOperation({ summary: 'Check in an asset (return it)' })
  async checkin(
    @Param('id') id: string,
    @Body() dto: CheckinDto,
    @CurrentUser() user: User,
  ) {
    return this.assignmentsService.checkin(id, dto, user.companyId);
  }
}
