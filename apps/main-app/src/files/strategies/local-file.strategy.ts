import { AllConfigType } from '@/config/config.type';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import { writeFile } from 'fs/promises';
import * as path from 'path';
import { FileStrategy } from './file.strategy';

export class LocalFileStrategy extends FileStrategy {
  private readonly domain: string;
  private readonly apiPrefix: string;
  private readonly storageDir: string;
  constructor(configService: ConfigService<AllConfigType>) {
    super(configService);

    const get = (name: string) =>
      configService.getOrThrow<string>(name as any, {
        infer: true,
      });

    this.domain = get('app.backendDomain');
    this.apiPrefix = get('app.apiPrefix');
    this.storageDir = `${get('app.workingDirectory')}/file-storage`;

    if (!fs.existsSync(this.storageDir)) fs.mkdirSync(this.storageDir);
  }

  getFileURLImplementation(file: Express.Multer.File): string {
    return `${this.domain}/${this.apiPrefix}/v1/files/${file.filename}`;
  }

  async saveFileImplementation(file: Express.Multer.File): Promise<string> {
    await writeFile(path.join(this.storageDir, file.filename), file.buffer);

    return file.filename;
  }

  getFilePath(fileName: string): string | undefined {
    const filePath = path.join(this.storageDir, fileName);
    if (!fs.existsSync(filePath)) return undefined;

    return filePath;
  }

  deleteFile(fileName: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      fs.rm(path.join(this.storageDir, fileName), { force: true }, (err) => {
        if (err) reject(err);
        return resolve();
      });
    });
  }
}
