import { Interest, User } from '@app/databases';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterestsController } from './interests.controller';
import { InterestsService } from './interests.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Interest])],
  providers: [InterestsService],
  controllers: [InterestsController],
})
export class InterestsModule {}
