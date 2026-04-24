import { Injectable, NotFoundException } from '@nestjs/common';
import { ReactionType } from '@prisma/client';
import { createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service.js';

const REVIEW_COUNTS = { id: true, likes: true, dislikes: true } as const;

export function buildFingerprint(ip: string, ua: string): string {
  return createHash('sha256').update(`${ip}${ua}`).digest('hex');
}

@Injectable()
export class ReactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async react(reviewId: string, type: ReactionType, fingerprint: string) {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new NotFoundException(`Review ${reviewId} not found`);

    const existing = await this.prisma.reaction.findUnique({
      where: { reviewId_fingerprint: { reviewId, fingerprint } },
    });

    if (!existing) {
      const countField = type === ReactionType.LIKE ? 'likes' : 'dislikes';
      await this.prisma.$transaction([
        this.prisma.reaction.create({ data: { reviewId, type, fingerprint } }),
        this.prisma.review.update({ where: { id: reviewId }, data: { [countField]: { increment: 1 } } }),
      ]);
    } else if (existing.type === type) {
      // Same type — undo
      const countField = type === ReactionType.LIKE ? 'likes' : 'dislikes';
      await this.prisma.$transaction([
        this.prisma.reaction.delete({ where: { id: existing.id } }),
        this.prisma.review.update({ where: { id: reviewId }, data: { [countField]: { decrement: 1 } } }),
      ]);
    } else {
      // Different type — switch
      const addField = type === ReactionType.LIKE ? 'likes' : 'dislikes';
      const removeField = type === ReactionType.LIKE ? 'dislikes' : 'likes';
      await this.prisma.$transaction([
        this.prisma.reaction.update({ where: { id: existing.id }, data: { type } }),
        this.prisma.review.update({
          where: { id: reviewId },
          data: { [addField]: { increment: 1 }, [removeField]: { decrement: 1 } },
        }),
      ]);
    }

    return this.prisma.review.findUnique({ where: { id: reviewId }, select: REVIEW_COUNTS });
  }

  async unreact(reviewId: string, fingerprint: string) {
    const existing = await this.prisma.reaction.findUnique({
      where: { reviewId_fingerprint: { reviewId, fingerprint } },
    });

    if (existing) {
      const countField = existing.type === ReactionType.LIKE ? 'likes' : 'dislikes';
      await this.prisma.$transaction([
        this.prisma.reaction.delete({ where: { id: existing.id } }),
        this.prisma.review.update({ where: { id: reviewId }, data: { [countField]: { decrement: 1 } } }),
      ]);
    }

    return this.prisma.review.findUnique({ where: { id: reviewId }, select: REVIEW_COUNTS });
  }
}
