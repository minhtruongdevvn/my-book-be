import { BadRequestException } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';
import { Chatbox } from '../collections/chatbox.collection';

export async function getMessages(
  where: any,
  select: any,
  repo: MongoRepository<Chatbox>,
) {
  const chatbox = await repo.createCursor(where).project(select).toArray();

  return chatbox[0]?.messages ?? [];
}

export async function isValidChatboxOrThrow(
  repo: MongoRepository<Chatbox>,
  chatboxId: string,
  adminId: number | undefined = undefined,
) {
  const chatbox = await repo.findOne({
    where: {
      _id: new ObjectId(chatboxId),
      ...(adminId && { admin: adminId }),
    },
    select: ['_id'],
  });

  if (chatbox == null) {
    throw new BadRequestException(
      `invalid group${!!adminId ? ' or admin' : ''}`,
    );
  }
}
