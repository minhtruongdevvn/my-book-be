import { IsAlphaWithSpaces } from '@/utils/validators/is-alpha-with-spaces.validator';

export class InterestCreateDto {
  @IsAlphaWithSpaces()
  name: string;
}
