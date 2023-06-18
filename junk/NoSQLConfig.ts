import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';

@Injectable()
export class NoSQLConfig implements MongooseOptionsFactory {
  constructor(private configService: ConfigService) {}

  createMongooseOptions(): MongooseModuleOptions {
    const username = this.configService.getOrThrow<string>(
      'CHATBOX_DB_USERNAME',
    );
    const password = this.configService.getOrThrow<string>(
      'CHATBOX_DB_PASSWORD',
    );
    const host = this.configService.getOrThrow<string>('CHATBOX_DB_HOST');
    const port = this.configService.getOrThrow<number>('CHATBOX_DB_PORT');
    const name = this.configService.getOrThrow<string>('CHATBOX_DB_NAME');
    const ssl = this.configService.get<boolean>('DATABASE_SSL_ENABLED');

    return {
      uri: `mongodb://${username}:${password}@${host}:${port}/${name}`,
      maxPoolSize:
        this.configService.get<number>('DATABASE_MAX_CONNECTIONS') ?? 100,
      rejectUnauthorized: this.configService.getOrThrow<boolean>(
        'DATABASE_REJECT_UNAUTHORIZED',
      ),
      ssl,
      ...(ssl
        ? {
            sslCA: this.configService.get('CHATBOX_DB_CA'),
            sslCert: this.configService.get('CHATBOX_DB_CERT'),
            sslKey: this.configService.get('CHATBOX_DB_KEY'),
          }
        : {}),
    };
  }
}
