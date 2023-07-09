import { AllConfigType } from '@/config/config.type';
import { ConfigService } from '@nestjs/config';
import { rm } from 'fs';
import { writeFile } from 'fs/promises';
import path from 'path';
import { FileStrategy } from './file.strategy';

export class LocalFileStrategy extends FileStrategy {
  private readonly domain: string;
  private readonly apiPrefix: string;
  constructor(config: ConfigService<AllConfigType>) {
    super();

    const get = (name: string) =>
      config.getOrThrow<string>(name as any, {
        infer: true,
      });

    this.domain = get('app.backendDomain');
    this.apiPrefix = get('app.apiPrefix');
  }

  getFileURL(file: Express.Multer.File): string {
    if (!file.filename) file.filename = this.generateFileName(file);
    return `${this.domain}/${this.apiPrefix}/v1/files/${file.filename}`;
  }

  async saveFile(file: Express.Multer.File): Promise<string> {
    if (!file.filename) file.filename = this.generateFileName(file);

    await writeFile(
      path.join(__dirname, 'file-storage', file.filename),
      file.buffer,
    );

    return file.filename;
  }

  deleteFile(fileName: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      rm(
        path.join(__dirname, 'file-storage', fileName),
        { force: true },
        (err) => {
          if (err) reject(err);
          return resolve();
        },
      );
    });
  }
}
