import { BaseUpdateRequest } from '@/conversations/common/types';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateRequest extends BaseUpdateRequest {
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
