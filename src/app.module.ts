import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HeaderResolver } from 'nestjs-i18n';
import { I18nModule } from 'nestjs-i18n/dist/i18n.module';
import * as path from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import { AuthGoogleModule } from './auth-google/auth-google.module';
import { AuthModule } from './auth/auth.module';
import { ChatboxesModule } from './chatboxes/chatboxes.module';
import appConfig from './config/app.config';
import authConfig from './config/auth.config';
import chatboxDatabaseConfig from './config/chatbox-database.config';
import { AllConfigType } from './config/config.type';
import databaseConfig from './config/database.config';
import fileConfig from './config/file.config';
import googleConfig from './config/google.config';
import mailConfig from './config/mail.config';
import {
  AppOrmConfigService,
  ChatboxOrmConfigService,
} from './database/typeorm-config.service';
import { FilesModule } from './files/files.module';
import { ForgotModule } from './forgot/forgot.module';
import { HomeModule } from './home/home.module';
import { MailConfigService } from './mail/mail-config.service';
import { MailModule } from './mail/mail.module';
import { UsersModule } from './users/users.module';
import { CHATBOX_DB_TOKEN } from './utils/app-constant';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        databaseConfig,
        authConfig,
        appConfig,
        mailConfig,
        fileConfig,
        googleConfig,
        chatboxDatabaseConfig,
      ],
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
    MailerModule.forRootAsync({
      useClass: MailConfigService,
    }),
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService<AllConfigType>) => ({
        fallbackLanguage: configService.getOrThrow('app.fallbackLanguage', {
          infer: true,
        }),
        loaderOptions: { path: path.join(__dirname, '/i18n/'), watch: true },
      }),
      resolvers: [
        {
          use: HeaderResolver,
          useFactory: (configService: ConfigService) => {
            return [configService.get('app.headerLanguage')];
          },
          inject: [ConfigService],
        },
      ],
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
    UsersModule,
    FilesModule,
    AuthModule,
    AuthGoogleModule,
    ForgotModule,
    MailModule,
    HomeModule,
    ChatboxesModule,
  ],
})
export class AppModule {}
