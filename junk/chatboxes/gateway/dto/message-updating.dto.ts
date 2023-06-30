import { IsNotEmpty, IsString } from 'class-validator';
import { MessageBaseDto } from './message-base.dto';

export class MessageUpdatingDto extends MessageBaseDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  content: string;
}
