import { AllConfigType } from '@/config/config.type';
import { ClientError, ClientErrorException } from '@app/common';
import { FileEntity } from '@app/databases';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { FileStrategy, getFileStrategy } from './strategies';

@Injectable()
export class FilesService {
  private readonly fileStrategy: FileStrategy;

  constructor(
    configService: ConfigService<AllConfigType>,
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
  ) {
    this.fileStrategy = getFileStrategy(configService);
  }

  findOne(findOption: FindOneOptions<FileEntity>) {
    return this.fileRepository.findOne(findOption);
  }

  async createFileEntity(
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
        path: this.getFileURL(file),
      }),
    );
  }

  generateFileName = (file: Express.Multer.File | Express.MulterS3.File) =>
    this.fileStrategy.generateFileName(file);

  getFileURL = (file: Express.Multer.File | Express.MulterS3.File) =>
    this.fileStrategy.getFileURL(file);

  saveFile = (file: Express.Multer.File | Express.MulterS3.File) =>
    this.fileStrategy.saveFile(file);

  getFilePath = (fileName: string) => this.fileStrategy.getFilePath(fileName);

  deleteFile = (fileName: string) => this.fileStrategy.deleteFile(fileName);
}
