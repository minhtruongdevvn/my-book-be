import { DatabasesModule } from '@app/databases';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { FriendModule } from './friend/friend.module';
import { RecommendationModule } from './recommendation/recommendation.module';
import { ExceptionFilter } from './utils/filters/exception.filter';
import { TransformResponseInterceptor } from './utils/interceptors/transform-response.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabasesModule.forRoot(),
    RecommendationModule,
    FriendModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: TransformResponseInterceptor },
    { provide: APP_FILTER, useClass: ExceptionFilter },
  ],
})
export class FriendJobModule {}
