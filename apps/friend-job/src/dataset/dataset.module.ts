import { Module } from '@nestjs/common';
import { DatasetController } from './dataset.controller';
import { DatasetService } from './dataset.service';

@Module({
  providers: [DatasetService],
  controllers: [DatasetController],
})
export class DatasetModule {}
