import { DatabasesModule } from '@app/databases';
import { AppClientModule } from '@app/microservices';
import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { HeaderResolver } from 'nestjs-i18n';
import { I18nModule } from 'nestjs-i18n/dist/i18n.module';
import { AddressesModule } from './addresses/addresses.module';
import { AuthGoogleModule } from './auth-google/auth-google.module';
import { AuthModule } from './auth/auth.module';
import appConfig from './config/app.config';
import authConfig from './config/auth.config';
import { AllConfigType } from './config/config.type';
import fileConfig from './config/file.config';
import googleConfig from './config/google.config';
import mailConfig from './config/mail.config';
import { ConversationsModule } from './conversations/conversations.module';
import { FilesModule } from './files/files.module';
import { ForgotModule } from './forgot/forgot.module';
import { FriendsModule } from './friends/friends.module';
import { HomeModule } from './home/home.module';
import { InterestsModule } from './interests/interests.module';
import { MailConfigService } from './mail/mail-config.service';
import { MailModule } from './mail/mail.module';
import { PostsModule } from './posts/posts.module';
import { UsersModule } from './users/users.module';
import { MongoExceptionFilter } from './utils/filters/mongo-exception.filter';
import { TypeORMExceptionFilter } from './utils/filters/typeorm-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [authConfig, appConfig, mailConfig, fileConfig, googleConfig],
      envFilePath: ['.env'],
    }),
    DatabasesModule.forRoot(),
    MailerModule.forRootAsync({
      useClass: MailConfigService,
    }),
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService<AllConfigType>) => ({
        fallbackLanguage: configService.getOrThrow('app.fallbackLanguage', {
          infer: true,
        }),
        loaderOptions: { path: __dirname + '/../../../i18n/', watch: true },
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
    AppClientModule.forRoot(),
    UsersModule,
    FilesModule,
    AuthModule,
    AuthGoogleModule,
    ForgotModule,
    MailModule,
    HomeModule,
    ConversationsModule,
    FriendsModule,
    AddressesModule,
    InterestsModule,
    PostsModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: MongoExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: TypeORMExceptionFilter,
    },
  ],
})
export class AppModule {}
