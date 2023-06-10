import { IsNotEmpty, IsString } from 'class-validator';
import { MessageBaseDto } from './message-base.dto';

export class MessageDeletingDto extends MessageBaseDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}
