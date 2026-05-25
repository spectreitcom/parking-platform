import './tracing';
import './sentry';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AdminApiModule } from './bff/admin-api/admin-api.module';
import { ApiModule } from './bff/api/api.module';
import { ManagerApiModule } from './bff/manager-api/manager-api.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  if (process.env.NODE_ENV === 'development') {
    // Swagger setup
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Parking Platform API')
      .setDescription('API documentation for Parking Platform')
      .setVersion('1.0.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'auth',
      )
      .build();

    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig, {
      include: [ApiModule],
    });

    SwaggerModule.setup('docs/app', app, swaggerDocument, {
      useGlobalPrefix: true,
      jsonDocumentUrl: '/docs/app/json',
    });

    const adminSwaggerConfig = new DocumentBuilder()
      .setTitle('Parking Platform API - Admin Client')
      .setDescription('API documentation for Admin Client')
      .setVersion('1.0.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'admin-auth',
      )
      .build();

    const adminSwaggerDocument = SwaggerModule.createDocument(
      app,
      adminSwaggerConfig,
      {
        include: [AdminApiModule],
      },
    );

    SwaggerModule.setup('docs/admin', app, adminSwaggerDocument, {
      useGlobalPrefix: true,
      jsonDocumentUrl: '/docs/admin/json',
    });

    const managerSwaggerConfig = new DocumentBuilder()
      .setTitle('Parking Platform API - Manager Client')
      .setDescription('API documentation for Manager Client')
      .setVersion('1.0.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'manager-auth',
      )
      .build();

    const managerSwaggerDocument = SwaggerModule.createDocument(
      app,
      managerSwaggerConfig,
      {
        include: [ManagerApiModule],
      },
    );

    SwaggerModule.setup('docs/manager', app, managerSwaggerDocument, {
      useGlobalPrefix: true,
      jsonDocumentUrl: '/docs/manager/json',
    });
  }

  await app.listen(process.env.PORT ?? 3003);
}

bootstrap().catch((e) => console.error(e));
