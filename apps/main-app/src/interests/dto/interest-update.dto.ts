import { IsAlphaWithSpaces } from '@/utils/validators/is-alpha-with-spaces.validator';

export class InterestUpdateDto {
  @IsAlphaWithSpaces(true)
  name: string;
}
