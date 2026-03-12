import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint — verifies DB connectivity' })
  @ApiOkResponse({ description: 'API is healthy' })
  async getHealth() {
    return this.appService.getHealth();
  }
}
