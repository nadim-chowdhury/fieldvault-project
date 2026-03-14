import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';

@ApiTags('Documents')
@ApiBearerAuth()
@Controller({ path: 'documents', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Upload/link a new document to an asset' })
  @ApiResponse({ status: HttpStatus.CREATED })
  create(@CurrentUser() user: User, @Body() createDto: CreateDocumentDto) {
    return this.documentsService.create(user.companyId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all documents for an asset' })
  @ApiQuery({ name: 'assetId', required: true })
  findAll(@CurrentUser() user: User, @Query('assetId') assetId: string) {
    return this.documentsService.findAllByAsset(user.companyId, assetId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific document by id' })
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.documentsService.findOne(user.companyId, id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Update a document' })
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateDto: UpdateDocumentDto,
  ) {
    return this.documentsService.update(user.companyId, id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Delete a document' })
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.documentsService.remove(user.companyId, id);
  }
}
