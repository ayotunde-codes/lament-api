import { Body, Controller, Delete, Param, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { ReactionsService, buildFingerprint } from './reactions.service.js';
import { CreateReactionDto } from './dto/create-reaction.dto.js';

@Controller('reviews')
export class ReactionsController {
  constructor(private readonly reactionsService: ReactionsService) {}

  @Post(':id/react')
  react(
    @Param('id') id: string,
    @Body() dto: CreateReactionDto,
    @Req() req: Request,
  ) {
    const fingerprint = buildFingerprint(
      req.ip ?? '',
      req.headers['user-agent'] ?? '',
    );
    return this.reactionsService.react(id, dto.type, fingerprint);
  }

  @Delete(':id/react')
  unreact(@Param('id') id: string, @Req() req: Request) {
    const fingerprint = buildFingerprint(
      req.ip ?? '',
      req.headers['user-agent'] ?? '',
    );
    return this.reactionsService.unreact(id, fingerprint);
  }
}
