import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { join } from 'path';
import { AppModule } from './app.module.js';
import type { AppConfig } from './config/app.config.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const config = app.get(ConfigService<AppConfig, true>);
  const nodeEnv = config.get('nodeEnv', { infer: true });
  const frontendUrl = config.get('frontendUrl', { infer: true });
  const port = config.get('port', { infer: true });

  // 6.3 — Helmet security headers
  app.use(helmet());

  // 6.2 — CORS
  app.enableCors({
    origin: ['http://localhost:3000', frontendUrl].filter(
      (v, i, arr) => v && arr.indexOf(v) === i,
    ),
    credentials: true,
  });

  // 6.1 — Global validation
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  // 6.5 — Swagger (non-production only)
  if (nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Lament API')
      .setDescription('Anonymous organisation review platform')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document);
  }

  await app.listen(port);
}
bootstrap();
