import { lowerCaseTransformer } from '@/utils/transformers/lower-case.transformer';
import { IsAlphaOrNumberWithSpecial } from '@/utils/validators/is-alpha-or-number-with-special.validator';
import { IsNotExist } from '@/utils/validators/is-not-exists.validator';
import { IsValidAddress } from '@/utils/validators/is-valid-address.validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  MinLength,
  Validate,
} from 'class-validator';

export class AuthRegisterLoginDto {
  @ApiProperty({ example: 'test1@example.com' })
  @Transform(lowerCaseTransformer)
  @Validate(IsNotExist, ['User'], {
    message: 'emailAlreadyExists',
  })
  @IsEmail()
  email: string;

  @IsAlphaOrNumberWithSpecial(['_'], true)
  alias?: string;

  @ApiProperty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John' })
  @IsNotEmpty()
  firstName: string;

  @IsNumber()
  @Transform((param) => +param.value)
  age: number;

  @ApiProperty({ example: 'Doe' })
  @IsNotEmpty()
  lastName: string;

  @IsAlphaOrNumberWithSpecial([',', ' '], false, false)
  @IsValidAddress()
  @Transform((param) => param.value.toLowerCase().replace('/', ', '))
  address: string;
}
