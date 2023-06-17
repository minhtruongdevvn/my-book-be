import { User } from '@/users/entities/user.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Interest } from './entity/interest.entity';
import { InterestsController } from './interests.controller';
import { InterestsService } from './interests.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Interest])],
  providers: [InterestsService],
  controllers: [InterestsController],
})
export class InterestsModule {}
