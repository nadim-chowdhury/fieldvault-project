import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private readonly isConfigured: boolean;

  constructor(private readonly configService: ConfigService) {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    if (cloudName) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
        api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
      });
      this.isConfigured = true;
      this.logger.log('Cloudinary configured');
    } else {
      this.isConfigured = false;
      this.logger.warn('Cloudinary not configured — uploads will return mock URLs');
    }
  }

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

    if (!this.isConfigured) {
      // Dev fallback — return mock URL
      const mockPublicId = `${folder}/${Date.now()}-${file.originalname}`;
      const mockUrl = `https://res.cloudinary.com/fieldvault/image/upload/${mockPublicId}`;
      this.logger.log(`[DEV MOCK] File uploaded: ${mockUrl} (${file.size} bytes)`);
      return { url: mockUrl, publicId: mockPublicId };
    }

    // Real Cloudinary upload
    return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `fieldvault/${folder}`,
          resource_type: 'auto',
          transformation: file.mimetype.startsWith('image/')
            ? [{ quality: 'auto', fetch_format: 'auto' }]
            : undefined,
        },
        (error, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            this.logger.error(`Cloudinary upload failed: ${error?.message}`);
            return reject(new BadRequestException('File upload failed. Please try again.'));
          }
          this.logger.log(`File uploaded to Cloudinary: ${result.secure_url} (${file.size} bytes)`);
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        },
      );
      uploadStream.end(file.buffer);
    });
  }
}

