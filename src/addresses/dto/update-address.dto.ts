import { Transform } from 'class-transformer';
import { IsAlphaWithSpaces } from 'src/utils/validators/is-alpha-with-spaces.validator';

export class UpdateAddressDto {
  @IsAlphaWithSpaces(true)
  @Transform((params) => params.value.toLowerCase())
  province?: string;

  @IsAlphaWithSpaces(true)
  @Transform((params) => params.value.toLowerCase())
  subProvince?: string;
}
