import { IsNotEmpty, IsString } from 'class-validator';
import { MessageBaseDto } from './message-base.dto';

export class MessageSeenDto extends MessageBaseDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}
