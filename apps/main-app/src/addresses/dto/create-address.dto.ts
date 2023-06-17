import { IsAlphaWithSpaces } from '@/utils/validators/is-alpha-with-spaces.validator';
import { Transform } from 'class-transformer';

export class AddressDto {
  @IsAlphaWithSpaces(false)
  @Transform((params) => params.value.toLowerCase())
  province: string;

  @IsAlphaWithSpaces(false)
  @Transform((params) => params.value.toLowerCase())
  subProvince: string;
}
