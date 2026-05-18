import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { generateAnonymousIdentity } from '../lib/anonymous-identity.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { ListCommentsQuery } from './dto/list-comments.dto.js';

const COMMENT_SELECT = {
  id: true,
  reviewId: true,
  username: true,
  avatar: true,
  avatarColor: true,
  body: true,
  createdAt: true,
} as const;

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByReview(reviewId: string, query: ListCommentsQuery) {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new NotFoundException(`Review ${reviewId} not found`);

    const { cursor, limit = 20 } = query;

    const comments = await this.prisma.comment.findMany({
      select: COMMENT_SELECT,
      where: { reviewId },
      orderBy: { createdAt: 'asc' },
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      take: limit,
    });

    const nextCursor =
      comments.length === limit ? comments[comments.length - 1].id : null;

    return { data: comments, nextCursor };
  }

  async create(reviewId: string, dto: CreateCommentDto) {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new NotFoundException(`Review ${reviewId} not found`);

    const identity = generateAnonymousIdentity();

    const comment = await this.prisma.comment.create({
      data: {
        reviewId,
        body: dto.body,
        ...identity,
      },
      select: COMMENT_SELECT,
    });

    return comment;
  }

  /** Returns just the count — used to show "X replies" in the feed without fetching all comments. */
  async getCountForReview(reviewId: string): Promise<number> {
    return this.prisma.comment.count({ where: { reviewId } });
  }

  /** Batch-fetch counts for multiple reviews (used in list endpoints). */
  async getCountsForReviews(reviewIds: string[]): Promise<Map<string, number>> {
    if (reviewIds.length === 0) return new Map();

    const grouped = await this.prisma.comment.groupBy({
      by: ['reviewId'],
      where: { reviewId: { in: reviewIds } },
      _count: { _all: true },
    });

    const map = new Map<string, number>(reviewIds.map((id) => [id, 0]));
    for (const row of grouped) map.set(row.reviewId, row._count._all);
    return map;
  }
}
