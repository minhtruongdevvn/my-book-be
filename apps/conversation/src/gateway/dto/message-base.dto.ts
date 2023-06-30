import { IsNotEmpty, IsString } from 'class-validator';

export class MessageBaseDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}
