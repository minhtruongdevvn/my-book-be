import { BadRequestException, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientProxy,
  ClientProxyFactory,
  Closeable,
  Transport,
} from '@nestjs/microservices';
import { catchError, lastValueFrom, Observable } from 'rxjs';
import { LastValueFromConfig } from 'rxjs/internal/lastValueFrom';
import { ServiceResponse } from '../types';

export class ClientProvider {
  constructor(private readonly client: ClientProxy & Closeable) {}

  async sendAndReceive<TResult, TInput>(pattern: any, input: TInput) {
    const response = await this.lastValueFrom(
      this.client.send<ServiceResponse<TResult>, TInput>(pattern, input),
    );
    return response.data as TResult;
  }

  async sendWithoutReceive<TInput>(pattern: any, input: TInput) {
    await this.lastValueFrom(
      this.client.send<ServiceResponse<void>, TInput>(pattern, input),
      { defaultValue: undefined },
    );
  }

  lastValueFrom<T>(source: Observable<T>, config?: LastValueFromConfig<T>) {
    source = source.pipe(
      catchError((err) => {
        throw new BadRequestException(err);
      }),
    );

    if (config) return lastValueFrom(source, config);
    return lastValueFrom(source);
  }

  static register(token: string) {
    const clientProvider: Provider = {
      provide: token,
      useFactory: (configService: ConfigService) => {
        return new ClientProvider(
          ClientProxyFactory.create({
            transport: Transport.REDIS,
            options: {
              host: configService.getOrThrow<string>('app.workerHost'),
              port: configService.getOrThrow<number>('app.workerPort'),
            },
          }),
        );
      },
      inject: [ConfigService],
    };
    return clientProvider;
  }
}
