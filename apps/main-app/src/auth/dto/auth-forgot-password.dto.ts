import { lowerCaseTransformer } from '@/utils/transformers/lower-case.transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';

export class AuthForgotPasswordDto {
  @ApiProperty()
  @Transform(lowerCaseTransformer)
  @IsEmail()
  email: string;
}
