import { ClientError, ClientErrorException } from '@app/common';
import {
  DynamicModule,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
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

const APP_CLIENT_TOKEN = 'app_client_token';
export const InjectAppClient = () => Inject(APP_CLIENT_TOKEN);

export class AppClientModule {
  static forRoot(): DynamicModule {
    return {
      module: AppClientModule,
      global: true,
      providers: [
        {
          provide: APP_CLIENT_TOKEN,
          useFactory: (config: ConfigService) => {
            return new ClientProvider(
              ClientProxyFactory.create({
                transport: Transport.REDIS,
                options: {
                  host: config.getOrThrow<string>('WORKER_HOST'),
                  port: config.getOrThrow<number>('WORKER_PORT'),
                },
              }),
            );
          },
          inject: [ConfigService],
        },
      ],
      exports: [APP_CLIENT_TOKEN],
    };
  }
}

export class ClientProvider {
  constructor(private readonly client: ClientProxy & Closeable) {}

  async sendAndReceive<TResult, TInput = unknown>(pattern: any, input: TInput) {
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

  emit<TInput>(pattern: any, input: TInput) {
    return this.client.emit<TInput>(pattern, input);
  }

  private lastValueFrom<T>(
    source: Observable<T>,
    config?: LastValueFromConfig<T>,
  ) {
    source = source.pipe(
      catchError((err: ServiceResponse & { status?: string }) => {
        if (err.status && err.status === 'error')
          throw new InternalServerErrorException();
        throw new ClientErrorException(
          err.error ?? { name: ClientError.UnprocessableEntity },
        );
      }),
    );

    if (config) return lastValueFrom(source, config);
    return lastValueFrom(source);
  }
}
