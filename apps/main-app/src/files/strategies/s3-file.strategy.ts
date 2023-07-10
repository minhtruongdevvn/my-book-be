import { AllConfigType } from '@/config/config.type';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import * as mime from 'mime';
import { FileStrategy } from './file.strategy';

export class S3FileStrategy extends FileStrategy {
  private readonly s3Config: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    defaultBucket: string;
  };

  constructor(configService: ConfigService<AllConfigType>) {
    super(configService);

    const get = (name: string) =>
      configService.getOrThrow<string>(name as any, {
        infer: true,
      });

    this.s3Config = {
      region: get('file.awsS3Region'),
      accessKeyId: get('file.accessKeyId'),
      defaultBucket: get('file.awsDefaultS3Bucket'),
      secretAccessKey: get('file.secretAccessKey'),
    };
  }

  getFileURLImplementation(file: Express.MulterS3.File): string {
    return (
      file.location ??
      `https://${this.s3Config.defaultBucket}.s3.${this.s3Config.region}.amazonaws.com/${file.filename}`
    );
  }

  async saveFileImplementation(file: Express.MulterS3.File): Promise<string> {
    const s3 = new S3Client({
      region: this.s3Config.region,
      credentials: {
        accessKeyId: this.s3Config.accessKeyId,
        secretAccessKey: this.s3Config.secretAccessKey,
      },
    });

    const contentType = mime.lookup(file.filename);

    await s3.send(
      new PutObjectCommand({
        Bucket: this.s3Config.defaultBucket,
        Key: file.filename,
        Body: file.buffer,
        ACL: 'public-read',
        ContentType: contentType,
      }),
    );

    return file.filename;
  }

  async deleteFile(fileName: string): Promise<void> {
    const s3 = new S3Client({
      region: this.s3Config.region,
      credentials: {
        accessKeyId: this.s3Config.accessKeyId,
        secretAccessKey: this.s3Config.secretAccessKey,
      },
    });

    await s3.send(
      new DeleteObjectCommand({
        Bucket: this.s3Config.defaultBucket,
        Key: fileName,
      }),
    );
  }

  getFilePath(): string | undefined {
    throw new Error('No getFilePath logic for S3');
  }
}
