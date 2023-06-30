import { IsNotEmpty, IsString } from 'class-validator';
import { MessageBaseDto } from './message-base.dto';

export class MessageSentDto extends MessageBaseDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}
