import { IsNotEmpty, IsString } from 'class-validator';
import { MessageBaseDto } from './message-base.dto';

export class MessageDeleteDto extends MessageBaseDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}
