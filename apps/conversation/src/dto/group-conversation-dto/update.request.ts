import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { BaseUpdateDto } from '@/conversation/common/types/bases';

export class UpdateRequest extends BaseUpdateDto {
  @IsString()
  @IsOptional()
  @ApiProperty()
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  admin: string;
}
