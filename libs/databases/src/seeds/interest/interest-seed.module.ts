import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Interest } from '../../entities/interest.entity';
import { InterestSeedService } from './interest-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([Interest])],
  providers: [InterestSeedService],
  exports: [InterestSeedService],
})
export class InterestSeedModule {}
