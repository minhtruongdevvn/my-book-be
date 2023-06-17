import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateChatboxDto implements Partial<UpdateChatboxDto> {
  @IsString()
  @IsOptional()
  @ApiProperty()
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  quickEmoji: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  theme: string;
}
