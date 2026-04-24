import { Module } from '@nestjs/common';
import { VoiceController } from './voice.controller.js';
import { VoiceService } from './voice.service.js';
import { StorageService } from './storage.service.js';

@Module({
  controllers: [VoiceController],
  providers: [VoiceService, StorageService],
})
export class VoiceModule {}
