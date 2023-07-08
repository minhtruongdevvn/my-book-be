import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from '../config/database.config';
import { SQLConfigService } from '../config/sql-config.service';
import { RoleSeedModule } from './role/role-seed.module';
import { StatusSeedModule } from './status/status-seed.module';
import { UserSeedModule } from './user/user-seed.module';

import { DataSource, DataSourceOptions } from 'typeorm';

import { MongooseModule } from '@nestjs/mongoose';
import helperDatabaseConfig from '../config/helper-database.config';
import { NoSQLConfigService } from '../config/nosql-config.service';
import { AddressSeedModule } from './address/address-seed.module';

import { InterestSeedModule } from './interest/interest-seed.module';

import { PostSeedModule } from './post/post-seed.module';

@Module({
  imports: [
    PostSeedModule,
    InterestSeedModule,
    AddressSeedModule,
    RoleSeedModule,
    StatusSeedModule,
    UserSeedModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, helperDatabaseConfig],
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
