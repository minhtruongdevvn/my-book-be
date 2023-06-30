import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class CreateRequest {
  @IsOptional()
  @ApiProperty()
  name?: string;

  @IsOptional()
  @ApiProperty()
  photo?: string;

  @IsOptional()
  @ApiProperty()
  memberIds?: number[];
}
