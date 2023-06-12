import { BadRequestException } from '@nestjs/common';
import { FilterQuery, ProjectionType } from 'mongoose';
import { MongoRepository } from 'src/utils/mongo/mongo-repository';
import { Chatbox } from '../collections/chatbox.document';

export async function getMessages(
  repo: MongoRepository<Chatbox>,
  filter?: FilterQuery<Chatbox>,
  projection?: ProjectionType<Chatbox> | null,
) {
  const chatbox = await repo.findOne(filter, projection);

  return chatbox?.messages ?? [];
}

export async function isValidChatboxOrThrow(
  repo: MongoRepository<Chatbox>,
  chatboxId: string,
  adminId: number | undefined = undefined,
) {
  const chatbox = await repo.findOne(
    {
      _id: chatboxId,
      ...(adminId && { admin: adminId }),
    },
    { _id: 1 },
  );

  if (chatbox == null) {
    throw new BadRequestException(
      `invalid group${!!adminId ? ' or admin' : ''}`,
    );
  }
}
