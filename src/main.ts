import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { appSettings, development } from '@common/configs/appSetting';
import compression from 'compression';
import { TransformInterceptor } from '@common/interceptors/transform/transform.interceptor';
import { ValidationPipe } from '@nestjs/common';
import { Logging } from '@common/providers/logging/logging';
import {
  customLogsColor,
  customLogsText,
} from '@common/providers/logging/customLogging';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LoggingInterceptor } from '@common/interceptors/logging/logging.interceptor';
import { AllExceptionFilter } from '@common/exceptions/customExceptionFilter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });

  app.use(helmet());

  development
    ? app.enableCors()
    : app.enableCors({
        origin: appSettings.host.client,
      });

  app.useBodyParser('json', {
    limit: '100mb',
  });

  app.use(
    compression({
      level: 6,
      threshold: 100 * 1000,
    }),
  );

  const logging = new Logging();

  app.useGlobalInterceptors(
    new TransformInterceptor(),
    new LoggingInterceptor(logging),
  );
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.useGlobalFilters(new AllExceptionFilter());

  app.setGlobalPrefix('api', {
    // exclude: ['auth/([^\\s]+)'],
  });

  const config = new DocumentBuilder()
    .setTitle('API Wing Writing')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-doc', app, document);

  await app.listen(appSettings.host.port, () => {
    logging.debug(
      `${customLogsText.bold}${customLogsColor.pink}listening on ${appSettings.host.port} 🚀`,
    );
    logging.debug(
      `${customLogsText.bold}${customLogsColor.pink}Api Documentation on http://localhost:${appSettings.host.port}/api-doc`,
    );
  });
}
bootstrap();
