import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity, Interest, Post, PostInterest, User } from '../../entities';
import { PostSeedService } from './post-seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, FileEntity, PostInterest, Interest, User]),
  ],
  providers: [PostSeedService],
  exports: [PostSeedService],
})
export class PostSeedModule {}
