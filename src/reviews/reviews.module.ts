import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller.js';
import { ReviewsService } from './reviews.service.js';
import { ReactionsModule } from '../reactions/reactions.module.js';
import { CommentsModule } from '../comments/comments.module.js';

@Module({
  imports: [ReactionsModule, CommentsModule],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
