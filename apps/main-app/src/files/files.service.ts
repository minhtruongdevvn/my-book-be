import { AllConfigType } from '@/config/config.type';
import { ClientError, ClientErrorException } from '@app/common';
import { FileEntity } from '@app/databases';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { writeFile } from 'fs/promises';
import * as mime from 'mime';
import * as path from 'path';
import { Repository } from 'typeorm';

@Injectable()
export class FilesService {
  private readonly driver: string;
  private readonly domain: string;
  private readonly apiPrefix: string;
  private s3Config: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    defaultBucket: string;
  };

  constructor(
    configService: ConfigService<AllConfigType>,
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
  ) {
    const get = (name: string) =>
      configService.getOrThrow<string>(name as any, {
        infer: true,
      });
    this.driver = get('file.driver');
    this.domain = get('app.backendDomain');
    this.apiPrefix = get('app.apiPrefix');
    this.s3Config = {
      region: get('file.awsS3Region'),
      accessKeyId: get('file.accessKeyId'),
      defaultBucket: get('file.awsDefaultS3Bucket'),
      secretAccessKey: get('file.secretAccessKey'),
    };
  }

  async uploadFile(
    file: Express.Multer.File | Express.MulterS3.File,
  ): Promise<FileEntity> {
    if (!file) {
      throw new ClientErrorException({
        name: ClientError.InvalidPayload,
        description: 'invalid file',
      });
    }

    return this.fileRepository.save(
      this.fileRepository.create({
        path: this.generatePath(file),
      }),
    );
  }

  generatePath(file: Express.Multer.File | Express.MulterS3.File) {
    const adapters = {
      local: () => {
        return `${this.domain}/${this.apiPrefix}/v1/files/${file.filename}`;
      },
      s3: () => (file as Express.MulterS3.File).location,
    };

    return adapters[this.driver]();
  }

  async save(file: Express.Multer.File | Express.MulterS3.File) {
    if (this.driver === 'local' && !this.isMulterS3File(file))
      await this.localSave(file);
    else if (this.driver === 's3' && this.isMulterS3File(file))
      await this.s3Save(file);
  }

  private isMulterS3File(
    file: Express.Multer.File | Express.MulterS3.File,
  ): file is Express.MulterS3.File {
    return 'bucket' in file;
  }

  private async localSave(file: Express.Multer.File) {
    await writeFile(
      path.join(__dirname, 'file-storage', file.filename),
      file.buffer,
    );
  }

  private async s3Save(file: Express.MulterS3.File) {
    const s3 = new S3Client({
      region: this.s3Config.region,
      credentials: {
        accessKeyId: this.s3Config.accessKeyId,
        secretAccessKey: this.s3Config.secretAccessKey,
      },
    });

    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
    const contentType = fileExtension ? mime.lookup(fileExtension) : undefined;

    await s3.send(
      new PutObjectCommand({
        Bucket: this.s3Config.defaultBucket,
        Key: `${randomStringGenerator()}.${file.originalname
          .split('.')
          .pop()
          ?.toLowerCase()}`,
        Body: file.buffer,
        ACL: 'public-read',
        ContentType: contentType,
      }),
    );
  }
}
