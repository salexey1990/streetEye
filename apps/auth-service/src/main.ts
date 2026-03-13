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
    .setTitle('streetEye Auth Service API')
    .setDescription(
      'Authentication and authorization API for streetEye platform.\n\n' +
      '## Features\n' +
      '- User registration with email verification\n' +
      '- JWT-based authentication\n' +
      '- Refresh token rotation\n' +
      '- Two-factor authentication (2FA)\n' +
      '- Session management\n' +
      '- Password reset',
    )
    .setVersion('1.0')
    .addTag('auth', 'Authentication operations')
    .addTag('admin', 'Admin operations')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'streetEye Auth API Docs',
  });

  const port = configService.get<number>('PORT', 3001);
  await app.listen(port);

  console.log(`Auth Service is running on port ${port}`);
  console.log(`Swagger UI: http://localhost:${port}/api/docs`);
}

void bootstrap();
