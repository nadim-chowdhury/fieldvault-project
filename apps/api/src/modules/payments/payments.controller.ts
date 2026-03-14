import { Controller, Get, Post, Body, Param, UseGuards, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { PaymentProvider } from './entities/payment.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';

@ApiTags('Payments')
@Controller({ path: 'payments', version: '1' })
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('checkout')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a payment checkout session' })
  createCheckout(@CurrentUser() user: User, @Body() body: { amount: number; provider: PaymentProvider }) {
    return this.paymentsService.createCheckoutSession(user.companyId, body.amount, body.provider);
  }

  @Get('history')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get payment history' })
  getHistory(@CurrentUser() user: User) {
    return this.paymentsService.findAll(user.companyId);
  }

  @Post('webhook/:provider')
  @ApiOperation({ summary: 'Webhook endpoint for payment providers (e.g. bKash, Nagad)' })
  handleWebhook(@Param('provider') provider: PaymentProvider, @Body() payload: any) {
    return this.paymentsService.handleWebhook(provider, payload);
  }
}
