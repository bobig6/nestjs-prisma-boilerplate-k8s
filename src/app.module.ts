import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { HealthModule } from './health/health.module';
import { S3Module } from './s3/s3.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [HealthModule, S3Module, UserModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
