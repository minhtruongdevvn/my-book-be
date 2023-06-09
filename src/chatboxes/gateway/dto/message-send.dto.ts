import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class MessageSentDto {
  @IsString()
  @IsNotEmpty()
  chatboxId: string;

  @IsNumber()
  userId: number;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsBoolean()
  @IsNotEmpty()
  isGroup: boolean;
}
