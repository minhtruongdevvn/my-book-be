import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import databaseConfig from './config/database.config';
import helperDatabaseConfig from './config/helper-database.config';
import { NoSQLConfigService } from './config/nosql-config.service';
import { SQLConfigService } from './config/sql-config.service';

export class DatabasesModule {
  static forRootAsync(options: { isGlobal?: boolean }): DynamicModule {
    const global = options.isGlobal
      ? Global
      : (target = () => undefined) => target;
    const imports = [
      ConfigModule.forRoot({
        load: [databaseConfig, helperDatabaseConfig],
        envFilePath: ['.env'],
      }),
      TypeOrmModule.forRootAsync({
        imports: [ConfigModule],
        useClass: SQLConfigService,
        dataSourceFactory: async (options: DataSourceOptions) => {
          return new DataSource(options).initialize();
        },
      }),
      MongooseModule.forRootAsync({
        imports: [ConfigModule],
        useClass: NoSQLConfigService,
        inject: [ConfigService],
      }),
    ];

    @global()
    @Module({
      imports,
    })
    class DynamicDatabasesModule {}

    return {
      module: DynamicDatabasesModule,
    };
  }
}
