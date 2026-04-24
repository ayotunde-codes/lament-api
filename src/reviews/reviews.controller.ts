import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ReviewsService } from './reviews.service.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { ListReviewsQuery } from './dto/list-reviews.dto.js';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  findAll(@Query() query: ListReviewsQuery) {
    return this.reviewsService.findAll(query);
  }

  @Get('org/:orgId')
  findByOrg(@Param('orgId') orgId: string, @Query() query: ListReviewsQuery) {
    return this.reviewsService.findByOrg(orgId, query);
  }

  @Post()
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  create(@Body() dto: CreateReviewDto) {
    return this.reviewsService.create(dto);
  }
}
