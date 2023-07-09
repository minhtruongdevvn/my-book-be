import { ClientError, ClientErrorException } from '@app/common';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export abstract class FileStrategy {
  generateFileName(file: Express.Multer.File | Express.MulterS3.File) {
    const extension = path.extname(file.originalname);
    if (!extension)
      throw new ClientErrorException({
        name: ClientError.UnprocessableEntity,
        description: 'file extension is not valid',
      });

    return `${uuidv4()}${extension.toLowerCase()}`;
  }

  abstract getFileURL(
    file: Express.Multer.File | Express.MulterS3.File,
  ): string;
  abstract deleteFile(fileName: string): Promise<void>;
  abstract saveFile(
    file: Express.Multer.File | Express.MulterS3.File,
  ): Promise<string>;
}

export const fileStrategyTypes = {
  local: 'local',
  s3: 's3',
};
