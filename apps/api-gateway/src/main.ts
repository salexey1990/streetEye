import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import compression from 'compression';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { HttpExceptionsFilter } from './filters/http-exceptions.filter';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { TimeoutInterceptor } from './interceptors/timeout.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security headers
  app.use(helmet({
    contentSecurityPolicy: false, // Disable for API
    crossOriginEmbedderPolicy: false,
  }));

  // Enable CORS
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGINS', '*').split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID', 'X-Request-ID'],
    exposedHeaders: [
      'X-Correlation-ID',
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
      'X-Cache',
    ],
    maxAge: 86400, // 24 hours
  });

  // Compression
  app.use(compression({
    level: 6,
    threshold: 1024, // 1KB minimum
  }));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionsFilter());

  // Global interceptors
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalInterceptors(new TimeoutInterceptor());

  // Global API prefix
  app.setGlobalPrefix('api/v1');

  // Swagger setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('streetEye API Gateway')
    .setDescription(
      'API Gateway for routing requests to microservices.\n\n' +
      '## Features\n' +
      '- Request routing to 10 microservices\n' +
      '- JWT authentication\n' +
      '- Rate limiting\n' +
      '- Response caching\n' +
      '- Health checks\n' +
      '- Circuit breaker',
    )
    .setVersion('1.0')
    .addTag('gateway', 'API Gateway operations')
    .addTag('health', 'Health check endpoints')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'streetEye API Gateway Docs',
  });

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);

  console.log(`API Gateway is running on port ${port}`);
  console.log(`Swagger UI: http://localhost:${port}/api/docs`);
  console.log(`Health Check: http://localhost:${port}/health`);
}

void bootstrap();
