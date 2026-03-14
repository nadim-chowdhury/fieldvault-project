import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  async sendAlert(phoneNumber: string, message: string): Promise<boolean> {
    // Mock implementation for WhatsApp alerts 
    this.logger.log(`[WhatsApp Mock] Sending alert to ${phoneNumber}: ${message}`);
    return true;
  }
}
