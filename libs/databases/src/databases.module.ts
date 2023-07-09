import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import databaseConfig from './config/database.config';
import helperDatabaseConfig from './config/helper-database.config';
import { NoSQLConfigService } from './config/nosql-config.service';
import { SQLConfigService } from './config/sql-config.service';

const OrmModules = {
  forRoot: {
    typeORM: TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: SQLConfigService,
      dataSourceFactory: async (options: DataSourceOptions) => {
        return new DataSource(options).initialize();
      },
    }),
    mongoose: MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useClass: NoSQLConfigService,
      inject: [ConfigService],
    }),
  },
};

export type DatabasesModuleConfig = {
  includes?: (keyof (typeof OrmModules)['forRoot'])[];
};

export class DatabasesModule {
  static forRoot(config?: DatabasesModuleConfig): DynamicModule {
    const imports = [
      ConfigModule.forRoot({
        load: [databaseConfig, helperDatabaseConfig],
        envFilePath: ['.env'],
      }),
    ];

    if (config?.includes) {
      imports.push(...config.includes.map((e) => OrmModules.forRoot[e]));
    } else {
      imports.push(...Object.values(OrmModules.forRoot));
    }

    @Global()
    @Module({
      imports,
    })
    class DynamicDatabasesModule {}

    return {
      module: DynamicDatabasesModule,
    };
  }
}
