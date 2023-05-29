import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class GetMessageDto {
  @ApiProperty()
  @IsNumber()
  count: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  nthFromEnd: number | undefined = undefined;
}
