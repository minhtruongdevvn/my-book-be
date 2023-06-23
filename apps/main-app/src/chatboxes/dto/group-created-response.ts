import { IsAlphaWithSpaces } from '@/utils/validators/is-alpha-with-spaces.validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { ChatboxWithUser } from './chatbox-with-user.dto';
import { Chatbox } from '@app/databases';

export class GroupCreatedResponse {
  constructor(
    chatbox: Chatbox,
    successMemberIds?: number[],
    failedMemberIds?: number[],
  ) {
    this.id = chatbox.id ?? '';
    this.name = chatbox.name ?? '';
    this.admin = chatbox.admin ?? -1;
    this.photo = chatbox.photo;
    this.successMemberIds = successMemberIds;
    this.failedMemberIds = failedMemberIds;
  }

  id: string;
  name: string;
  admin: number;
  photo?: string;
  successMemberIds?: number[];
  failedMemberIds?: number[];
}
