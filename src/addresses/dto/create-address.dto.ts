import { Transform } from 'class-transformer';
import { IsAlphaWithSpaces } from 'src/utils/validators/is-alpha-with-spaces.validator';

export class AddressDto {
  @IsAlphaWithSpaces(false)
  @Transform((params) => params.value.toLowerCase())
  province: string;

  @IsAlphaWithSpaces(false)
  @Transform((params) => params.value.toLowerCase())
  subProvince: string;
}
