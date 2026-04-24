import { Injectable, NotFoundException } from '@nestjs/common';
import { Organization } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateOrganizationDto } from './dto/create-organization.dto.js';
import { ListOrganizationsQuery } from './dto/list-organizations.dto.js';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListOrganizationsQuery) {
    const { search, industry, page = 1, limit = 20 } = query;

    const orgs = await this.prisma.organization.findMany({
      where: {
        ...(search && { name: { contains: search, mode: 'insensitive' } }),
        ...(industry && { industry }),
      },
      orderBy: { name: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return this.enrichWithStats(orgs);
  }

  async findOne(id: string) {
    const org = await this.prisma.organization.findUnique({ where: { id } });
    if (!org) throw new NotFoundException(`Organization ${id} not found`);
    const [enriched] = await this.enrichWithStats([org]);
    return enriched;
  }

  async findTop() {
    const topRatings = await this.prisma.review.groupBy({
      by: ['orgId'],
      _avg: { rating: true },
      _count: { rating: true },
      orderBy: { _avg: { rating: 'desc' } },
      take: 5,
    });

    if (topRatings.length === 0) return [];

    const orgIds = topRatings.map((r) => r.orgId);
    const orgs = await this.prisma.organization.findMany({
      where: { id: { in: orgIds } },
    });

    const orgMap = new Map(orgs.map((o) => [o.id, o]));

    return topRatings.map((r) => ({
      ...orgMap.get(r.orgId)!,
      averageRating: r._avg.rating ?? 0,
      reviewCount: r._count.rating,
    }));
  }

  async create(dto: CreateOrganizationDto) {
    return this.prisma.organization.create({ data: dto });
  }

  private async enrichWithStats(orgs: Organization[]) {
    if (orgs.length === 0) return [];

    const orgIds = orgs.map((o) => o.id);
    const ratings = await this.prisma.review.groupBy({
      by: ['orgId'],
      where: { orgId: { in: orgIds } },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const statsMap = new Map(
      ratings.map((r) => [
        r.orgId,
        { averageRating: r._avg.rating ?? 0, reviewCount: r._count.rating },
      ]),
    );

    return orgs.map((org) => ({
      ...org,
      averageRating: statsMap.get(org.id)?.averageRating ?? 0,
      reviewCount: statsMap.get(org.id)?.reviewCount ?? 0,
    }));
  }
}
