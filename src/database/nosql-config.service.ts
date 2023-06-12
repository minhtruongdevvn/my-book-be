import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';
import { AllConfigType } from 'src/config/config.type';

@Injectable()
export class NoSQLConfigService implements MongooseOptionsFactory {
  constructor(private configService: ConfigService<AllConfigType>) {}

  createMongooseOptions(): MongooseModuleOptions {
    const username = this.configService.get(`cb_database.username`, {
      infer: true,
    });
    const password = this.configService.get(`cb_database.password`, {
      infer: true,
    });
    const host = this.configService.get(`cb_database.host`, {
      infer: true,
    });
    const port = this.configService.get(`cb_database.port`, {
      infer: true,
    });
    const name = this.configService.get(`cb_database.name`, { infer: true });

    return {
      uri: `mongodb://${username}:${password}@${host}:${port}/${name}`,
      ca: this.configService.get(`cb_database.ca`, { infer: true }),
      cert: this.configService.get(`cb_database.cert`, { infer: true }),
      key: this.configService.get(`cb_database.key`, { infer: true }),
    };
  }
}
