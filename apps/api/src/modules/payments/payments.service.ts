import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentProvider, PaymentStatus } from './entities/payment.entity';
import { Company, CompanyPlan } from '../companies/entities/company.entity';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepo: Repository<Payment>,
    @InjectRepository(Company)
    private readonly companiesRepo: Repository<Company>,
  ) {}

  async createCheckoutSession(companyId: string, amount: number, provider: PaymentProvider): Promise<Payment> {
    const payment = this.paymentsRepo.create({
      companyId,
      amount,
      provider,
      status: PaymentStatus.PENDING,
      transactionId: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    });

    return this.paymentsRepo.save(payment);
  }

  async handleWebhook(provider: PaymentProvider, payload: any) {
    this.logger.log(`Received webhook for provider: ${provider}`);
    const transactionId = payload.transactionId;
    if (!transactionId) return;

    const payment = await this.paymentsRepo.findOne({ where: { transactionId } });
    if (!payment) return;

    // Mock logic: assume successful
    if (payload.status === 'SUCCESS') {
      payment.status = PaymentStatus.COMPLETED;
      await this.paymentsRepo.save(payment);

      // Upgrade company plan to PRO or ENTERPRISE depending on amount
      const company = await this.companiesRepo.findOne({ where: { id: payment.companyId } });
      if (company) {
        if (payment.amount >= 249) {
          company.plan = CompanyPlan.ENTERPRISE;
        } else if (payment.amount >= 149) {
          company.plan = CompanyPlan.PRO;
        }
        await this.companiesRepo.save(company);
        this.logger.log(`Company ${company.name} upgraded to ${company.plan}`);
      }
    }
  }

  async findAll(companyId: string) {
    return this.paymentsRepo.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
  }
}
