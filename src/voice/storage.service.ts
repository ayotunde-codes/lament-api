import { Injectable } from '@nestjs/common';
import { writeFile, mkdir } from 'fs/promises';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class StorageService {
  private readonly uploadDir = join(process.cwd(), 'uploads', 'voice');

  async save(file: Express.Multer.File): Promise<string> {
    await mkdir(this.uploadDir, { recursive: true });
    const ext = extname(file.originalname) || '.webm';
    const filename = `${randomUUID()}${ext}`;
    await writeFile(join(this.uploadDir, filename), file.buffer);
    return `/uploads/voice/${filename}`;
  }
}
