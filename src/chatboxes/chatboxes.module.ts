import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CHATBOX_DB_TOKEN } from 'src/utils/app-constant';
import { ChatboxGateway } from './chatbox-gateway';
import { ChatboxesController } from './chatboxes.controller';
import { ChatboxesService } from './chatboxes.service';
import { Chatbox } from './collections/chatbox.collection';

@Module({
  imports: [TypeOrmModule.forFeature([Chatbox], CHATBOX_DB_TOKEN)],
  controllers: [ChatboxesController],
  providers: [ChatboxesService, ChatboxGateway],
})
export class ChatboxesModule {}
