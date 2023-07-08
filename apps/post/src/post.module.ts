import {
  DatabasesModule,
  FileEntity,
  Post,
  PostInterest,
} from '@app/databases';
import { rootProviders } from '@app/microservices';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostController } from './post.controller';
import { PostService } from './post.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabasesModule.forRoot(),
    TypeOrmModule.forFeature([Post, PostInterest, FileEntity]),
  ],
  controllers: [PostController],
  providers: [PostService, ...rootProviders],
})
export class PostModule {}
