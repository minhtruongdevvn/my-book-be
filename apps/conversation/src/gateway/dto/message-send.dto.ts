import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export class MessageSendDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsDate()
  @IsNotEmpty()
  at: Date | string | number;
}
