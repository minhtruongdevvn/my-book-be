import { ClientError, ClientErrorException } from '@app/common';
import { S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { ConfigService } from '@nestjs/config';
import {
  MulterModuleOptions,
  MulterOptionsFactory,
} from '@nestjs/platform-express';
import { Exception } from 'handlebars';
import { diskStorage } from 'multer';
import multerS3 from 'multer-s3';
import * as path from 'path';
import { AllConfigType } from '../config/config.type';
@Injectable()
export class FileMulterConfigService implements MulterOptionsFactory {
  constructor(private readonly configService: ConfigService<AllConfigType>) {}

  createMulterOptions(): MulterModuleOptions {
    return {
      storage: this.getDriver(),
      limits: {
        fileSize: this.configService.get('file.maxFileSize', { infer: true }),
      },
      fileFilter: (request, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
          return callback(
            new ClientErrorException({
              name: ClientError.InvalidPayload,
              description: 'invalid file type',
            }),
            false,
          );
        }

        callback(null, true);
      },
    };
  }

  private getDriver() {
    const driver = this.configService.getOrThrow('file.driver', {
      infer: true,
    });
    if (driver === 'local') {
      return this.localStorage();
    } else if (driver === 's3') {
      return this.s3Storage();
    }

    throw new Exception('invalid file driver');
  }

  private localStorage() {
    return diskStorage({
      destination: path.join(__dirname, 'file-storage'),
      filename: (request, file, callback) => {
        callback(
          null,
          `${randomStringGenerator()}.${file.originalname
            .split('.')
            .pop()
            ?.toLowerCase()}`,
        );
      },
    });
  }

  private s3Storage() {
    const s3 = new S3Client({
      region: this.configService.get('file.awsS3Region', { infer: true }),
      credentials: {
        accessKeyId: this.configService.getOrThrow('file.accessKeyId', {
          infer: true,
        }),
        secretAccessKey: this.configService.getOrThrow('file.secretAccessKey', {
          infer: true,
        }),
      },
    });

    return multerS3({
      s3: s3,
      bucket: this.configService.getOrThrow('file.awsDefaultS3Bucket', {
        infer: true,
      }),
      acl: 'public-read',
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: (request, file, callback) => {
        callback(
          null,
          `${randomStringGenerator()}.${file.originalname
            .split('.')
            .pop()
            ?.toLowerCase()}`,
        );
      },
    });
  }
}
