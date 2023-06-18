import { DatabasesModule } from '@app/databases';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatasetModule } from './dataset/dataset.module';
import { RecommendationModule } from './recommendation/recommendation.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabasesModule.forRootAsync({ isGlobal: true }),
    RecommendationModule,
    DatasetModule,
  ],
})
export class FriendJobModule {}
