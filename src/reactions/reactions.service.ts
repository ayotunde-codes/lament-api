import { Injectable, NotFoundException } from '@nestjs/common';
import { ReactionType } from '@prisma/client';
import { createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service.js';

export type ReactionCounts = Record<ReactionType, number>;

const ZERO_COUNTS: ReactionCounts = {
  REAL_TEA: 0,
  CAP: 0,
  HOT_TAKE: 0,
  HELPFUL: 0,
  TOO_REAL: 0,
};

export function buildFingerprint(ip: string, ua: string): string {
  return createHash('sha256').update(`${ip}${ua}`).digest('hex');
}

@Injectable()
export class ReactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async react(reviewId: string, type: ReactionType, fingerprint: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });
    if (!review) throw new NotFoundException(`Review ${reviewId} not found`);

    const existing = await this.prisma.reaction.findUnique({
      where: { reviewId_fingerprint: { reviewId, fingerprint } },
    });

    if (!existing) {
      await this.prisma.reaction.create({
        data: { reviewId, type, fingerprint },
      });
    } else if (existing.type === type) {
      await this.prisma.reaction.delete({ where: { id: existing.id } });
    } else {
      await this.prisma.reaction.update({
        where: { id: existing.id },
        data: { type },
      });
    }

    return this.getCountsResponse(reviewId);
  }

  async unreact(reviewId: string, fingerprint: string) {
    const existing = await this.prisma.reaction.findUnique({
      where: { reviewId_fingerprint: { reviewId, fingerprint } },
    });
    if (existing)
      await this.prisma.reaction.delete({ where: { id: existing.id } });
    return this.getCountsResponse(reviewId);
  }

  private async getCountsResponse(reviewId: string) {
    const counts = await this.getReactionCounts(reviewId);
    return { id: reviewId, reactionCounts: counts };
  }

  async getReactionCounts(reviewId: string): Promise<ReactionCounts> {
    const grouped = await this.prisma.reaction.groupBy({
      by: ['type'],
      where: { reviewId },
      _count: { _all: true },
    });
    const counts: ReactionCounts = { ...ZERO_COUNTS };
    for (const row of grouped) counts[row.type] = row._count._all;
    return counts;
  }

  async getReactionCountsForReviews(
    reviewIds: string[],
  ): Promise<Map<string, ReactionCounts>> {
    if (reviewIds.length === 0) return new Map();
    const grouped = await this.prisma.reaction.groupBy({
      by: ['reviewId', 'type'],
      where: { reviewId: { in: reviewIds } },
      _count: { _all: true },
    });
    const map = new Map<string, ReactionCounts>(
      reviewIds.map((id) => [id, { ...ZERO_COUNTS }]),
    );
    for (const row of grouped) {
      const entry = map.get(row.reviewId);
      if (entry) entry[row.type] = row._count._all;
    }
    return map;
  }
}
