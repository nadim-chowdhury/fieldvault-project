import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { SitesService } from './sites.service';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';

@ApiTags('Sites')
@ApiBearerAuth()
@Controller({ path: 'sites', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Create a new site' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'The site has been successfully created.' })
  create(@CurrentUser() user: User, @Body() createSiteDto: CreateSiteDto) {
    return this.sitesService.create(user.companyId, createSiteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sites for the company' })
  findAll(@CurrentUser() user: User) {
    return this.sitesService.findAll(user.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific site by id' })
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.sitesService.findOne(user.companyId, id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Update a site' })
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateSiteDto: UpdateSiteDto,
  ) {
    return this.sitesService.update(user.companyId, id, updateSiteDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a site' })
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.sitesService.remove(user.companyId, id);
  }
}
