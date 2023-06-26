import { Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { FriendJobModule } from './friend-job.module';

const logger = new Logger('Friend job');

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  );
  const config = appContext.get(ConfigService);

  const app = await NestFactory.createMicroservice(FriendJobModule, {
    transport: Transport.REDIS,
    options: {
      host: config.getOrThrow<string>('WORKER_HOST'),
      port: config.getOrThrow<number>('WORKER_PORT'),
    },
  });

  app.enableShutdownHooks();
  await app.listen().then(() => logger.log('Microservice is listening'));
}
void bootstrap();
