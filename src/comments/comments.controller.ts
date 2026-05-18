import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CommentsService } from './comments.service.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { ListCommentsQuery } from './dto/list-comments.dto.js';

@Controller('reviews/:reviewId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  findByReview(
    @Param('reviewId') reviewId: string,
    @Query() query: ListCommentsQuery,
  ) {
    return this.commentsService.findByReview(reviewId, query);
  }

  @Post()
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  create(
    @Param('reviewId') reviewId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(reviewId, dto);
  }
}
