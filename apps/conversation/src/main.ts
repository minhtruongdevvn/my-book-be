import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { ConversationModule } from './conversation.module';
import { ChatboxSocketIOAdapter } from './gateway/adapter';

const logger = new Logger('Conversation');

async function bootstrap() {
  const app = await NestFactory.create(ConversationModule);
  const config = app.get(ConfigService);

  app.connectMicroservice({
    transport: Transport.REDIS,
    options: {
      host: config.getOrThrow<string>('WORKER_HOST'),
      port: config.getOrThrow<number>('WORKER_PORT'),
    },
  });

  const chatAdapter = new ChatboxSocketIOAdapter(app, config);
  await chatAdapter.connectToRedis();
  app.useWebSocketAdapter(chatAdapter);

  await app.startAllMicroservices();
  await app
    .listen(config.getOrThrow<number>('CHAT_PORT'))
    .then(() => logger.log('conversation service is listening'));
}
void bootstrap();
