import { lowerCaseTransformer } from '@/utils/transformers/lower-case.transformer';
import { IsExist } from '@/utils/validators/is-exists.validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, Validate } from 'class-validator';

export class AuthEmailLoginDto {
  @ApiProperty({ example: 'test1@example.com' })
  @Transform(lowerCaseTransformer)
  @Validate(IsExist, ['User'], {
    message: 'emailNotExists',
  })
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;
}
