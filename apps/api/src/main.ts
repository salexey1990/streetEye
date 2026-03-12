import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors();
  
  // Global API prefix
  app.setGlobalPrefix('api/v1');
  
  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('streetEye API')
    .setDescription('The streetEye Links Management API')
    .setVersion('1.0')
    .addTag('links', 'Link management operations')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'streetEye API Docs',
  });
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`API Service is running on port ${port}`);
  console.log(`Swagger UI: http://localhost:${port}/api/docs`);
}

void bootstrap();
