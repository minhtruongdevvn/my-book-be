import appConfig from '@/config/app.config';
import databaseConfig from '@/config/database.config';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SQLConfigService } from '../sql-config.service';
import { RoleSeedModule } from './role/role-seed.module';
import { StatusSeedModule } from './status/status-seed.module';
import { UserFriendSeedModule } from './user-friend/user-friend-seed.module';
import { UserSeedModule } from './user/user-seed.module';

import { DataSource, DataSourceOptions } from 'typeorm';

import chatboxDatabaseConfig from '@/config/helper-database.config';
import { MongooseModule } from '@nestjs/mongoose';
import { NoSQLConfigService } from '../nosql-config.service';
import { AddressSeedModule } from './address/address-seed.module';

import { InterestSeedModule } from './interest/interest-seed.module';

@Module({
  imports: [
    InterestSeedModule,
    AddressSeedModule,
    RoleSeedModule,
    StatusSeedModule,
    UserSeedModule,
    UserFriendSeedModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig, chatboxDatabaseConfig],
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      useClass: SQLConfigService,
      dataSourceFactory: async (options: DataSourceOptions) => {
        return new DataSource(options).initialize();
      },
    }),
    MongooseModule.forRootAsync({
      useClass: NoSQLConfigService,
      inject: [ConfigService],
    }),
  ],
})
export class SeedModule {}
