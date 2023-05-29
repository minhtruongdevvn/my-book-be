import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import appConfig from 'src/config/app.config';
import databaseConfig from 'src/config/database.config';
import {
  AppOrmConfigService,
  ChatboxOrmConfigService,
} from '../typeorm-config.service';
import { RoleSeedModule } from './role/role-seed.module';
import { StatusSeedModule } from './status/status-seed.module';
import { UserSeedModule } from './user/user-seed.module';

import chatboxDatabaseConfig from 'src/config/chatbox-database.config';
import { CHATBOX_DB_TOKEN } from 'src/utils/app-constant';
import { DataSource, DataSourceOptions } from 'typeorm';
import { ChatboxSeedModule } from './chatbox/chatbox-seed.module';

@Module({
  imports: [
    ChatboxSeedModule,
    RoleSeedModule,
    StatusSeedModule,
    UserSeedModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig, chatboxDatabaseConfig],
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      useClass: AppOrmConfigService,
      dataSourceFactory: async (options: DataSourceOptions) => {
        return new DataSource(options).initialize();
      },
    }),
    TypeOrmModule.forRootAsync({
      useClass: ChatboxOrmConfigService,
      name: CHATBOX_DB_TOKEN,
      dataSourceFactory: async (options: DataSourceOptions) => {
        return new DataSource(options).initialize();
      },
    }),
  ],
})
export class SeedModule {}
