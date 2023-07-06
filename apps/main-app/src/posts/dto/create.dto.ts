import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Length } from 'class-validator';

export class CreatePostDto {
  @IsOptional()
  @IsString()
  @Length(0, 200)
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  backgroundCode?: string;

  @IsOptional()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  interests?: number[];
}
