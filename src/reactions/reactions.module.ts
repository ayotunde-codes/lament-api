import { Module } from '@nestjs/common';
import { ReactionsController } from './reactions.controller.js';
import { ReactionsService } from './reactions.service.js';

@Module({
  controllers: [ReactionsController],
  providers: [ReactionsService],
})
export class ReactionsModule {}
