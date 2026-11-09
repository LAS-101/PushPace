import { StandardSchemaValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.setGlobalPrefix('api');
  app.use(cookieParser());
  // Validates every `@Body/@Param/@Query({ schema })` against its Zod schema.
  app.useGlobalPipes(new StandardSchemaValidationPipe());
  // The Next.js dev server proxies /api, but direct calls are allowed too.
  app.enableCors({
    origin: config.getOrThrow<string>('FRONTEND_URL').split(','),
    credentials: true,
  });
  app.enableShutdownHooks();

  const port = config.getOrThrow<number>('PORT');
  await app.listen(port);
  console.log(`PushPace API listening on http://localhost:${port}/api`);
}
await bootstrap();
