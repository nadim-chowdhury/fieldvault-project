import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Upload a file (placeholder — replace with Cloudinary integration)
   * In production, this would use the Cloudinary SDK to upload and return a URL.
   * For now, returns a mock URL so the API contract is established.
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'assets',
  ): Promise<{ url: string; publicId: string }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} not allowed. Allowed: ${allowedTypes.join(', ')}`,
      );
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('File too large. Maximum size: 10MB');
    }

    // TODO: Replace with actual Cloudinary upload
    // const cloudinary = require('cloudinary').v2;
    // cloudinary.config({
    //   cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
    //   api_key: this.configService.get('CLOUDINARY_API_KEY'),
    //   api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    // });
    // const result = await cloudinary.uploader.upload_stream({ folder });

    const mockPublicId = `${folder}/${Date.now()}-${file.originalname}`;
    const mockUrl = `https://res.cloudinary.com/fieldvault/image/upload/${mockPublicId}`;

    this.logger.log(`File uploaded: ${mockUrl} (${file.size} bytes)`);

    return {
      url: mockUrl,
      publicId: mockPublicId,
    };
  }
}
