import { IsAlphaWithSpaces } from '@/utils/validators/is-alpha-with-spaces.validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateChatboxDto {
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsOptional()
  @ApiProperty()
  photo?: string;

  @IsOptional()
  @ApiProperty()
  memberIds?: number[];
}
