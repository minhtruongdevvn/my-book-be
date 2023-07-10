import { AllConfigType } from '@/config/config.type';
import { ClientError, ClientErrorException } from '@app/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export abstract class FileStrategy {
  private readonly validationOption: {
    fileSize?: number;
    allowedExtensions?: RegExp;
  };

  constructor(configService: ConfigService<AllConfigType>) {
    this.validationOption = {};
    this.validationOption.fileSize = configService.get('file.maxFileSize', {
      infer: true,
    });
    this.validationOption.allowedExtensions = /\.(jpg|jpeg|png|gif)$/i;
  }

  generateFileName(file: Express.Multer.File | Express.MulterS3.File) {
    const extension = path.extname(file.originalname);
    if (!extension)
      throw new ClientErrorException({
        name: ClientError.UnprocessableEntity,
        description: 'file extension is not valid',
      });

    return `${uuidv4()}${extension.toLowerCase()}`;
  }

  async saveFile(
    file: Express.Multer.File | Express.MulterS3.File,
  ): Promise<string> {
    this.validate(file);
    if (!file.filename) file.filename = this.generateFileName(file);
    return this.saveFileImplementation(file);
  }

  getFileURL(file: Express.Multer.File | Express.MulterS3.File) {
    if (!file.filename) file.filename = this.generateFileName(file);
    return this.getFileURLImplementation(file);
  }

  abstract getFileURLImplementation(
    fileName: Express.Multer.File | Express.MulterS3.File,
  ): string;
  abstract deleteFile(fileName: string): Promise<void>;
  abstract getFilePath(fileName: string): string | undefined;
  abstract saveFileImplementation(
    file: Express.Multer.File | Express.MulterS3.File,
  ): Promise<string>;

  private validate(file: Express.Multer.File | Express.MulterS3.File) {
    const error: string[] = [];

    if (
      this.validationOption.fileSize &&
      file.size > this.validationOption.fileSize
    ) {
      error.push('file too large');
    }

    if (
      this.validationOption.allowedExtensions &&
      !file.originalname.match(this.validationOption.allowedExtensions)
    ) {
      error.push('invalid file type');
    }

    if (error.length != 0) {
      throw new ClientErrorException({
        name: ClientError.InvalidPayload,
        description: error.join(', '),
      });
    }
  }
}

export const fileStrategyTypes = {
  local: 'local',
  s3: 's3',
};
