import { ConfigService } from '@nestjs/config';
import { LocalFileStrategy } from './local-file.strategy';
import { S3FileStrategy } from './s3-file.strategy';

export const getFileStrategy = (configService: ConfigService) => {
  const driver = configService.getOrThrow<string>('file.driver');
  switch (driver) {
    case 'local':
      return new LocalFileStrategy(configService);
    case 's3':
      return new S3FileStrategy(configService);
    default:
      throw new Error('file driver is not support');
  }
};
export * from './file.strategy';
