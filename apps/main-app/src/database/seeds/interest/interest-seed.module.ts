import { Interest } from '@/interests/entity/interest.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterestSeedService } from './interest-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([Interest])],
  providers: [InterestSeedService],
  exports: [InterestSeedService],
})
export class InterestSeedModule {}
