import { NestFactory } from '@nestjs/core';
import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerDocumentOptions,
} from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  const port = process.env.PORT || 3000;

  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('nest-api')
    .setDescription('API for the Boilerplate nest DevOps project.')
    .addBearerAuth(
      {
        type: 'http',
        in: 'header',
        name: 'Authorization',
        description: 'Authorization bearer token',
        scheme: 'Bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .build();

  const options: SwaggerDocumentOptions = {};

  const document = SwaggerModule.createDocument(app, config, options);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(port);

  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();

export default bootstrap;
