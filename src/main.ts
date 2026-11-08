import { StandardSchemaValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import hbs from 'hbs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new StandardSchemaValidationPipe());

  app.useStaticAssets(join(import.meta.dirname, '..', 'public'));
  app.setBaseViewsDir(join(import.meta.dirname, '..', 'views'));
  app.setViewEngine('hbs');
  app.setLocal('layout', 'layouts/app');

  hbs.registerPartials(join(import.meta.dirname, '..', 'views', 'partials'));
  hbs.registerHelper('nomor', (index: number, mulai: unknown) => index + 1 + (typeof mulai === 'number' ? mulai : 0));
  hbs.registerHelper('sama', (a: unknown, b: unknown) => a === b);

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
