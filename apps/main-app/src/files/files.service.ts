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

    const path = {
      local: `/${this.configService.get('app.apiPrefix', { infer: true })}/v1/${
        file.path
      }`,
      s3: (file as Express.MulterS3.File).location,
    };

    return this.fileRepository.save(
      this.fileRepository.create({
        path: path[
          this.configService.getOrThrow('file.driver', { infer: true })
        ],
      }),
    );
  }
}
