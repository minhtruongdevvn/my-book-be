import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Interest } from './entity/interest.entity';
import { InterestsController } from './interests.controller';
import { InterestsService } from './interests.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Interest])],
  providers: [InterestsService],
  controllers: [InterestsController],
})
export class InterestsModule {}
