import { Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { PostModule } from './post.module';

const logger = new Logger('Post');

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  );
  const config = appContext.get(ConfigService);

  const app = await NestFactory.createMicroservice(PostModule, {
    transport: Transport.REDIS,
    options: {
      host: config.getOrThrow<string>('WORKER_HOST'),
      port: config.getOrThrow<number>('WORKER_PORT'),
    },
  });

  await app.listen().then(() => logger.log('post service is listening'));
}

void bootstrap();
