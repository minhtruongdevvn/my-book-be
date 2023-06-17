import { IsAlphaWithSpaces } from '@/utils/validators/is-alpha-with-spaces.validator';
import { Transform } from 'class-transformer';

export class UpdateAddressDto {
  @IsAlphaWithSpaces(true)
  @Transform((params) => params.value.toLowerCase())
  province?: string;

  @IsAlphaWithSpaces(true)
  @Transform((params) => params.value.toLowerCase())
  subProvince?: string;
}
