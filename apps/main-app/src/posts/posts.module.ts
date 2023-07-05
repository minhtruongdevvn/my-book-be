import { FileMulterConfigService } from '@/files/file-multer-config.service';
import { FilesModule } from '@/files/files.module';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { PostsController } from './posts.controller';

@Module({
  imports: [
    FilesModule,
    MulterModule.registerAsync({
      inject: [ConfigService],
      useClass: FileMulterConfigService,
    }),
  ],
  controllers: [PostsController],
})
export class PostsModule {}
