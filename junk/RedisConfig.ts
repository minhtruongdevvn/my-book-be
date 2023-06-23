import { AllConfigType } from '@/config/config.type';
import { ConfigService } from '@nestjs/config';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';

export class FriendsController {
  private client: ClientProxy;
  constructor(configService: ConfigService<AllConfigType>) {
    this.client = ClientProxyFactory.create({
      transport: Transport.REDIS,
      options: {
        host: configService.getOrThrow<string>('app.workerHost', {
          infer: true,
        }),
        port: configService.getOrThrow<number>('app.workerPort', {
          infer: true,
        }),
      },
    });
  }
}
