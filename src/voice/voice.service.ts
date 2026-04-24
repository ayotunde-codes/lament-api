import { Injectable } from '@nestjs/common';
import { StorageService } from './storage.service.js';

@Injectable()
export class VoiceService {
  constructor(private readonly storage: StorageService) {}

  async upload(file: Express.Multer.File): Promise<{ url: string }> {
    const url = await this.storage.save(file);
    return { url };
  }
}
