import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseUpdateDto } from '../../common/types/bases';

export class UpdateRequest extends BaseUpdateDto {
  @IsString()
  @IsOptional()
  @ApiProperty()
  name?: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  admin?: number;

  @IsOptional()
  @ApiProperty()
  photo?: string;
}
