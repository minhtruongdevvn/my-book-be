import { NestFactory } from '@nestjs/core';
import { FriendJobModule } from './friend-job.module';

async function bootstrap() {
  const app = await NestFactory.create(FriendJobModule);
  await app.listen(4000);
}
void bootstrap();
