import { IsBoolean, IsMongoId, IsNotEmpty } from 'class-validator';

export class MessageBaseDto {
  @IsBoolean()
  @IsNotEmpty()
  isGroup: boolean;
}
