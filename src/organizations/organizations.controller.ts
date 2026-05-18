import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { OrganizationsService } from './organizations.service.js';
import { CreateOrganizationDto } from './dto/create-organization.dto.js';
import { ListOrganizationsQuery } from './dto/list-organizations.dto.js';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly orgsService: OrganizationsService) {}

  @Get('top')
  findTop() {
    return this.orgsService.findTop();
  }

  @Get()
  findAll(@Query() query: ListOrganizationsQuery) {
    return this.orgsService.findAll(query);
  }

  @Get(':id/vibe-checks')
  vibeChecks(@Param('id') id: string) {
    return this.orgsService.vibeChecks(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orgsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateOrganizationDto) {
    return this.orgsService.create(dto);
  }
}
