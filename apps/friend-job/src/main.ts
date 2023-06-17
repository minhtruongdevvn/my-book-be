import { NestFactory } from '@nestjs/core';
import { FriendRecommenderModule } from './friend-job.module';

async function bootstrap() {
  const app = await NestFactory.create(FriendRecommenderModule);
  await app.listen(4000);
}
void bootstrap();
