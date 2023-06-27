import { DatabasesModule } from '@app/databases';
import {
  AppClientModule,
  ExceptionFilter,
  TransformResponseInterceptor,
} from '@app/microservices';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { FriendModule } from './friend/friend.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabasesModule.forRoot(),
    FriendModule,
    AppClientModule.forRoot(),
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: TransformResponseInterceptor },
    { provide: APP_FILTER, useClass: ExceptionFilter },
  ],
})
export class FriendJobModule {}
