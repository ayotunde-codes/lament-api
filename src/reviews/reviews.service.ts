import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  ReactionsService,
  type ReactionCounts,
} from '../reactions/reactions.service.js';
import { CommentsService } from '../comments/comments.service.js';
import { generateAnonymousIdentity } from '../lib/anonymous-identity.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { ListReviewsQuery, ReviewSort } from './dto/list-reviews.dto.js';

const REVIEW_SELECT = {
  id: true,
  orgId: true,
  username: true,
  avatar: true,
  avatarColor: true,
  rating: true,
  heading: true,
  body: true,
  emoji: true,
  voiceUrl: true,
  tags: true,
  tenure: true,
  role: true,
  status: true,
  createdAt: true,
  org: { select: { id: true, name: true, logo: true, industry: true } },
} satisfies Prisma.ReviewSelect;

type RawReview = Prisma.ReviewGetPayload<{ select: typeof REVIEW_SELECT }>;
type ReviewWithCounts = RawReview & {
  reactionCounts: ReactionCounts;
  commentCount: number;
};

const ZERO_COUNTS: ReactionCounts = {
  REAL_TEA: 0,
  CAP: 0,
  HOT_TAKE: 0,
  HELPFUL: 0,
  TOO_REAL: 0,
};

function buildOrderBy(
  sort: ReviewSort,
): Prisma.ReviewOrderByWithRelationInput[] {
  switch (sort) {
    case ReviewSort.Top:
      return [{ rating: 'desc' }, { createdAt: 'desc' }];
    case ReviewSort.Lowest:
      return [{ rating: 'asc' }, { createdAt: 'desc' }];
    default:
      return [{ createdAt: 'desc' }];
  }
}

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reactions: ReactionsService,
    private readonly comments: CommentsService,
  ) {}

  async findAll(query: ListReviewsQuery) {
    const { cursor, limit = 20, tag } = query;
    const reviews = await this.prisma.review.findMany({
      select: REVIEW_SELECT,
      where: tag ? { tags: { has: tag } } : undefined,
      orderBy: [{ createdAt: 'desc' }],
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      take: limit,
    });
    return this.toPage(await this.attachCounts(reviews), limit);
  }

  async findByOrg(orgId: string, query: ListReviewsQuery) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
    });
    if (!org) throw new NotFoundException(`Organization ${orgId} not found`);

    const { sort = ReviewSort.Latest, cursor, limit = 20, tag } = query;
    const reviews = await this.prisma.review.findMany({
      select: REVIEW_SELECT,
      where: { orgId, ...(tag && { tags: { has: tag } }) },
      orderBy: buildOrderBy(sort),
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      take: limit,
    });
    return this.toPage(await this.attachCounts(reviews), limit);
  }

  async create(dto: CreateReviewDto) {
    const org = await this.prisma.organization.findUnique({
      where: { id: dto.orgId },
    });
    if (!org)
      throw new NotFoundException(`Organization ${dto.orgId} not found`);

    const identity = generateAnonymousIdentity();

    const review = await this.prisma.review.create({
      data: {
        orgId: dto.orgId,
        rating: dto.rating,
        heading: dto.heading,
        body: dto.body,
        emoji: dto.emoji,
        voiceUrl: dto.voiceUrl,
        tags: dto.tags ?? [],
        tenure: dto.tenure,
        role: dto.role,
        status: dto.status,
        ...identity,
      },
      select: REVIEW_SELECT,
    });
    const [withCounts] = await this.attachCounts([review]);
    return withCounts;
  }

  private async attachCounts(
    reviews: RawReview[],
  ): Promise<ReviewWithCounts[]> {
    const ids = reviews.map((r) => r.id);
    const [reactionCounts, commentCounts] = await Promise.all([
      this.reactions.getReactionCountsForReviews(ids),
      this.comments.getCountsForReviews(ids),
    ]);
    return reviews.map((r) => ({
      ...r,
      reactionCounts: reactionCounts.get(r.id) ?? { ...ZERO_COUNTS },
      commentCount: commentCounts.get(r.id) ?? 0,
    }));
  }

  private toPage<T extends { id: string }>(reviews: T[], limit: number) {
    const nextCursor =
      reviews.length === limit ? reviews[reviews.length - 1].id : null;
    return { data: reviews, nextCursor };
  }
}
