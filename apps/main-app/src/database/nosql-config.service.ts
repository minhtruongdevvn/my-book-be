import { AllConfigType } from '@/config/config.type';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';

@Injectable()
export class NoSQLConfigService implements MongooseOptionsFactory {
  constructor(private configService: ConfigService<AllConfigType>) {}

  createMongooseOptions(): MongooseModuleOptions {
    const username = this.configService.get(`helper_database.username`, {
      infer: true,
    });
    const password = this.configService.get(`helper_database.password`, {
      infer: true,
    });
    const host = this.configService.get(`helper_database.host`, {
      infer: true,
    });
    const port = this.configService.get(`helper_database.port`, {
      infer: true,
    });
    const name = this.configService.get(`helper_database.name`, {
      infer: true,
    });
    const ssl = this.configService.get('database.sslEnabled', { infer: true });

    return {
      uri: `mongodb://${username}:${password}@${host}:${port}/${name}`,
      maxPoolSize:
        this.configService.get('database.maxConnections', {
          infer: true,
        }) ?? 100,
      rejectUnauthorized: this.configService.get(
        'database.rejectUnauthorized',
        { infer: true },
      ),
      ssl,
      ...(ssl
        ? {
            sslCA:
              this.configService.get('database.ca', { infer: true }) ??
              undefined,
            sslCert:
              this.configService.get('database.cert', { infer: true }) ??
              undefined,
            sslKey:
              this.configService.get('database.key', { infer: true }) ??
              undefined,
          }
        : {}),
    };
  }
}
