import { DatabasesModule, Post, PostInterest, User } from '@app/databases';
import { AppClientModule, rootProviders } from '@app/microservices';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection, Schema } from 'mongoose';
import { PostRecommendationController } from './post-recommendation.controller';
import { PostRecommendationService } from './post-recommendation.service';
import { RecoByFriendProvider, RecoByInterestProvider } from './providers';
import { RECO_STORAGE_KEY } from './storage-key';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabasesModule.forRoot(),
    TypeOrmModule.forFeature([Post, User, PostInterest]),
    AppClientModule.forRoot(),
    ScheduleModule.forRoot(),
  ],
  controllers: [PostRecommendationController],
  providers: [
    PostRecommendationService,
    RecoByInterestProvider,
    RecoByFriendProvider,
    {
      provide: RECO_STORAGE_KEY,
      useFactory: (connection: Connection) => {
        const schema = new Schema({}, { strict: false });
        return connection.model(RECO_STORAGE_KEY, schema);
      },
      inject: [getConnectionToken()],
    },
    ...rootProviders,
  ],
})
export class PostRecommendationModule {}
