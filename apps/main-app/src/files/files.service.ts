import { AllConfigType } from '@/config/config.type';
import { ClientError, ClientErrorException } from '@app/common';
import { FileEntity } from '@app/databases';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class FilesService {
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
  ) {}

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

  private generatePath(file: Express.Multer.File | Express.MulterS3.File) {
    const adapters = {
      local: () => {
        const domain = this.configService.getOrThrow('app.backendDomain', {
          infer: true,
        });
        const apiPrefix = this.configService.getOrThrow('app.apiPrefix', {
          infer: true,
        });

        return `${domain}/${apiPrefix}/v1/files/${file.filename}`;
      },
      s3: () => (file as Express.MulterS3.File).location,
    };

    const driver = this.configService.getOrThrow('file.driver', {
      infer: true,
    });

    return adapters[driver]();
  }
}
