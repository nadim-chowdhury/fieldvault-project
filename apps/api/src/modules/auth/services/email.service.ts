import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    if (smtpHost) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: this.configService.get<number>('SMTP_PORT', 587),
        secure: this.configService.get<number>('SMTP_PORT', 587) === 465,
        auth: {
          user: this.configService.get<string>('SMTP_USER'),
          pass: this.configService.get<string>('SMTP_PASS'),
        },
      });
      this.logger.log('Email transporter configured');
    } else {
      this.logger.warn('SMTP not configured — emails will be logged to console');
    }
  }

  async sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
    const appUrl = this.configService.get<string>('APP_URL', 'http://localhost:3000');
    const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

    const subject = 'FieldVault — Reset Your Password';
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:24px;">
        <h2 style="color:#0f172a;">Reset Your Password</h2>
        <p style="color:#475569;">Click the button below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0;">Reset Password</a>
        <p style="color:#94a3b8;font-size:13px;">If you didn't request this, ignore this email.</p>
      </div>
    `;

    await this.send(to, subject, html);
  }

  async sendInvitationEmail(to: string, companyName: string, tempPassword: string): Promise<void> {
    const appUrl = this.configService.get<string>('APP_URL', 'http://localhost:3000');

    const subject = `You've been invited to ${companyName} on FieldVault`;
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:24px;">
        <h2 style="color:#0f172a;">Welcome to FieldVault!</h2>
        <p style="color:#475569;">You've been invited to join <strong>${companyName}</strong>.</p>
        <p style="color:#475569;">Your temporary password is:</p>
        <div style="background:#f1f5f9;padding:12px 16px;border-radius:8px;font-family:monospace;font-size:16px;color:#0f172a;">${tempPassword}</div>
        <a href="${appUrl}/login" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0;">Sign In</a>
        <p style="color:#94a3b8;font-size:13px;">Please change your password after first login.</p>
      </div>
    `;

    await this.send(to, subject, html);
  }

  async sendMaintenanceAlert(to: string, assetName: string, dueDate: string): Promise<void> {
    const subject = `⚠️ Maintenance Due: ${assetName}`;
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:24px;">
        <h2 style="color:#0f172a;">Maintenance Reminder</h2>
        <p style="color:#475569;"><strong>${assetName}</strong> has maintenance scheduled for <strong>${dueDate}</strong>.</p>
        <p style="color:#475569;">Please ensure this is completed on time to maintain compliance.</p>
      </div>
    `;

    await this.send(to, subject, html);
  }

  async sendComplianceReport(to: string, pdfBuffer: Buffer, monthStr: string): Promise<void> {
    const subject = `FieldVault Compliance Report - ${monthStr}`;
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:24px;">
        <h2 style="color:#0f172a;">Monthly Compliance Report</h2>
        <p style="color:#475569;">Attached is your automated compliance report for <strong>${monthStr}</strong>.</p>
        <p style="color:#475569;">Thank you for using FieldVault!</p>
      </div>
    `;

    const attachments = [{
      filename: `compliance-report-${monthStr.replace(' ', '-').toLowerCase()}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf',
    }];

    await this.send(to, subject, html, attachments);
  }

  private async send(to: string, subject: string, html: string, attachments?: any[]): Promise<void> {
    const from = this.configService.get<string>('SMTP_FROM', 'noreply@fieldvault.app');

    if (this.transporter) {
      try {
        await this.transporter.sendMail({ from, to, subject, html, attachments });
        this.logger.log(`Email sent to ${to}: ${subject}`);
      } catch (error) {
        this.logger.error(`Failed to send email to ${to}: ${error}`);
      }
    } else {
      this.logger.log(`[DEV EMAIL] To: ${to} | Subject: ${subject}`);
      this.logger.debug(html);
    }
  }
}
