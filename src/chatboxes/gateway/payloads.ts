import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class MessageSentPayload {
  @IsString()
  @IsNotEmpty()
  chatboxId: string;

  @IsNumber()
  userId: number;

  @IsString()
  @IsNotEmpty()
  content: string;
}
