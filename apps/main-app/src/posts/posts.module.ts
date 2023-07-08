import { FilesModule } from '@/files/files.module';
import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';

@Module({
  imports: [FilesModule],
  controllers: [PostsController],
})
export class PostsModule {}
