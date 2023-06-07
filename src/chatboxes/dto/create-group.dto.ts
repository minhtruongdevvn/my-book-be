import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { IsAlphaWithSpaces } from 'src/utils/validators/is-alpha-with-spaces.validator';

export class CreateChatboxDto {
  @IsNotEmpty()
  @IsAlphaWithSpaces()
  @ApiProperty()
  name: string;

  @IsOptional()
  @ApiProperty()
  photo?: string;
}
