import { IsNotEmpty, IsString, IsDate } from 'class-validator';
import { MessageBaseDto } from './message-base.dto';

export class MessageSendDto extends MessageBaseDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsDate()
  @IsNotEmpty()
  at: Date;
}
