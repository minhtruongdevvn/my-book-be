import { IsNotEmpty, IsString } from 'class-validator';
import { MessageBaseDto } from './message-base.dto';

export class MessageUpdateDto extends MessageBaseDto {
  @IsNotEmpty()
  @IsString()
  content: string;
}
