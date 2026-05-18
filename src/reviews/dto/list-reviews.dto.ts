import { IsEnum, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { REVIEW_TAGS } from '../review-tags.constant.js';

export enum ReviewSort {
  Latest = 'latest',
  Top = 'top',
  Lowest = 'lowest',
}

export class ListReviewsQuery {
  @IsOptional()
  @IsEnum(ReviewSort)
  sort?: ReviewSort = ReviewSort.Latest;

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  @IsIn(REVIEW_TAGS)
  tag?: string;
}
