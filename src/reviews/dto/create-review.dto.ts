import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Tenure, Role, EmploymentStatus } from '@prisma/client';
import { REVIEW_TAGS } from '../review-tags.constant.js';

export class CreateReviewDto {
  @IsString()
  @IsNotEmpty()
  orgId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  heading: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  body: string;

  @IsOptional()
  @IsString()
  emoji?: string;

  @IsOptional()
  @IsUrl()
  voiceUrl?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3)
  @IsIn(REVIEW_TAGS, { each: true })
  tags?: string[];

  @IsOptional()
  @IsEnum(Tenure)
  tenure?: Tenure;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsEnum(EmploymentStatus)
  status?: EmploymentStatus;
}
