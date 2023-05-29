import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chatbox } from 'src/chatboxes/collections/chatbox.collection';
import { CHATBOX_DB_TOKEN } from 'src/utils/app-constant';
import { MongoRepository } from 'typeorm';

@Injectable()
export class ChatboxSeedService {
  constructor(
    @InjectRepository(Chatbox, CHATBOX_DB_TOKEN)
    private repository: MongoRepository<Chatbox>,
  ) {}

  async run() {
    await this.repository.createCollectionIndex({ members: 1 });
  }
}
