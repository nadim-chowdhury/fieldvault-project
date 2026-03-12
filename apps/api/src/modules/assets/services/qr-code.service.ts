import { Injectable, Logger } from '@nestjs/common';
import QRCode from 'qrcode';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class QrCodeService {
  private readonly logger = new Logger(QrCodeService.name);

  constructor(private readonly configService: ConfigService) {}

  async generateQrCodeDataUrl(assetId: string): Promise<string> {
    const appUrl = this.configService.get<string>('APP_URL', 'http://localhost:3001');
    const scanUrl = `${appUrl}/scan/${assetId}`;

    const dataUrl = await QRCode.toDataURL(scanUrl, {
      type: 'image/png',
      width: 300,
      margin: 2,
      color: {
        dark: '#1a1a2e',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    });

    this.logger.log(`QR code generated for asset ${assetId}`);
    return dataUrl;
  }

  async generateQrCodeSvg(assetId: string): Promise<string> {
    const appUrl = this.configService.get<string>('APP_URL', 'http://localhost:3001');
    const scanUrl = `${appUrl}/scan/${assetId}`;

    return QRCode.toString(scanUrl, {
      type: 'svg',
      width: 300,
      margin: 2,
      color: {
        dark: '#1a1a2e',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    });
  }
}
