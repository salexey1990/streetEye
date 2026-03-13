import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Enable CORS
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGINS', '*').split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global API prefix
  app.setGlobalPrefix('api/v1');

  // Swagger setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('streetEye User Service API')
    .setDescription(
      'API for managing user profiles, subscriptions, and purchases.\n\n' +
      '## Features\n' +
      '- User profile management\n' +
      '- Subscription management (Free/Premium/Masterclass)\n' +
      '- Course purchases\n' +
      '- Achievements and statistics\n' +
      '- GDPR compliance (export/delete data)',
    )
    .setVersion('1.0')
    .addTag('users', 'User profile operations')
    .addTag('subscriptions', 'Subscription management')
    .addTag('purchases', 'Course purchases')
    .addTag('achievements', 'User achievements')
    .addTag('admin', 'Admin operations')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'streetEye User API Docs',
  });

  const port = configService.get<number>('PORT', 3002);
  await app.listen(port);

  console.log(`User Service is running on port ${port}`);
  console.log(`Swagger UI: http://localhost:${port}/api/docs`);
}

void bootstrap();
