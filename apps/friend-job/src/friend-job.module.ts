import { DatabasesModule } from '@app/databases';
import { AppClientModule, rootProviders } from '@app/microservices';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FriendModule } from './friend/friend.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabasesModule.forRoot(),
    FriendModule,
    AppClientModule.forRoot(),
  ],
  providers: [...rootProviders],
})
export class FriendJobModule {}
