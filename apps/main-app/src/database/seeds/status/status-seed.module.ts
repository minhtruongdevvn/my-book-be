import { Status } from '@/statuses/entities/status.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatusSeedService } from './status-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([Status])],
  providers: [StatusSeedService],
  exports: [StatusSeedService],
})
export class StatusSeedModule {}
