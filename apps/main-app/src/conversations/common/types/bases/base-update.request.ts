import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export abstract class BaseUpdateDto {
  @IsString()
  @IsOptional()
  @ApiProperty()
  quickEmoji?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  theme?: string;
}
