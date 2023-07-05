import { DatabasesModule, Post } from '@app/databases';
import {
  ExceptionFilter,
  TransformResponseInterceptor,
} from '@app/microservices';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostController } from './post.controller';
import { PostService } from './post.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabasesModule.forRoot(),
    TypeOrmModule.forFeature([Post]),
  ],
  controllers: [PostController],
  providers: [
    PostService,
    { provide: APP_INTERCEPTOR, useClass: TransformResponseInterceptor },
    { provide: APP_FILTER, useClass: ExceptionFilter },
  ],
})
export class PostModule {}
