import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend communication
  app.enableCors();

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global prefix for API versioning
  app.setGlobalPrefix('api/v1');

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('streetEye Challenge Service API')
    .setDescription(
      'API for managing photography challenges and Heat Mode sessions.\n\n' +
      '## Features\n' +
      '- Browse and discover photography challenges\n' +
      '- Get personalized challenge recommendations\n' +
      '- Participate in Heat Mode sessions (timed challenge marathons)\n' +
      '- Multi-language support (Ukrainian, Russian, English)',
    )
    .setVersion('1.0')
    .addTag('challenges', 'Challenge management operations')
    .addTag('heat-mode', 'Heat Mode session operations')
    .addTag('categories', 'Challenge category operations')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'streetEye Challenge API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = process.env.PORT || 3002;
  await app.listen(port);

  console.log(`Challenge Service is running on port ${port}`);
  console.log(`Swagger UI: http://localhost:${port}/api/docs`);
}

void bootstrap();
