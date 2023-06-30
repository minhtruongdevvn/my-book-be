import { NestFactory } from '@nestjs/core';
import { ConversationModule } from './conversation.module';

async function bootstrap() {
  const app = await NestFactory.create(ConversationModule);
  await app.listen(3000);
}
void bootstrap();
