import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  app.setGlobalPrefix('api');

  // app.useGlobalPipes(new ValidationPipe({
  //   transform: true
  // }));
  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     whitelist: true,
  //     forbidNonWhitelisted: true
  //   })
  // );

  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Sistema Personal')
    .setDescription('Documentacion de backend del sistema de personal')
    .setVersion('1.0')  
    .addTag('login-auth')
    .addTag('personal')
    .addTag('Licencias')
    .addTag('cargos')
    .addTag('horarios')
    .addTag('Asistencia')
    .addTag('Semilla')
    .addTag('Reportes')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  const logger = new Logger('Bootstrap');

  await app.listen(process.env.PORT);
  logger.log(process.env.PORT)
}

bootstrap();
