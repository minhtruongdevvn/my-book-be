import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chatbox } from 'src/chatboxes/collections/chatbox.collection';
import { RoomUserMapper } from 'src/chatboxes/collections/room-user-mapper.collection';
import { CHATBOX_DB_TOKEN } from 'src/utils/app-constant';
import { MongoRepository } from 'typeorm';

@Injectable()
export class ChatboxSeedService {
  constructor(
    @InjectRepository(Chatbox, CHATBOX_DB_TOKEN)
    private repository: MongoRepository<Chatbox>,
    @InjectRepository(RoomUserMapper, CHATBOX_DB_TOKEN)
    private roomRepository: MongoRepository<RoomUserMapper>,
  ) {}

  async run() {
    await this.repository.createCollectionIndex({ members: 1 });
    await this.roomRepository.createCollectionIndex({ 'clients.clientId': 1 });
  }
}
