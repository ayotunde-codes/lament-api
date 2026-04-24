import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
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
  likes: true,
  dislikes: true,
  createdAt: true,
  org: { select: { id: true, name: true, logo: true, industry: true } },
} satisfies Prisma.ReviewSelect;

function buildOrderBy(sort: ReviewSort): Prisma.ReviewOrderByWithRelationInput[] {
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
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListReviewsQuery) {
    const { cursor, limit = 20 } = query;

    const reviews = await this.prisma.review.findMany({
      select: REVIEW_SELECT,
      orderBy: [{ createdAt: 'desc' }],
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      take: limit,
    });

    return this.toPage(reviews, limit);
  }

  async findByOrg(orgId: string, query: ListReviewsQuery) {
    const org = await this.prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) throw new NotFoundException(`Organization ${orgId} not found`);

    const { sort = ReviewSort.Latest, cursor, limit = 20 } = query;

    const reviews = await this.prisma.review.findMany({
      select: REVIEW_SELECT,
      where: { orgId },
      orderBy: buildOrderBy(sort),
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      take: limit,
    });

    return this.toPage(reviews, limit);
  }

  async create(dto: CreateReviewDto) {
    const org = await this.prisma.organization.findUnique({ where: { id: dto.orgId } });
    if (!org) throw new NotFoundException(`Organization ${dto.orgId} not found`);

    const identity = generateAnonymousIdentity();

    return this.prisma.review.create({
      data: {
        orgId: dto.orgId,
        rating: dto.rating,
        heading: dto.heading,
        body: dto.body,
        emoji: dto.emoji,
        voiceUrl: dto.voiceUrl,
        ...identity,
      },
      select: REVIEW_SELECT,
    });
  }

  private toPage(reviews: any[], limit: number) {
    const nextCursor = reviews.length === limit ? reviews[reviews.length - 1].id : null;
    return { data: reviews, nextCursor };
  }
}
