import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PrismaService } from '../prisma/prisma.service';
import { TerminusModule } from '@nestjs/terminus';
import { S3Module } from '../s3/s3.module';

@Module({
  imports: [TerminusModule, S3Module],
  providers: [PrismaService],
  controllers: [HealthController],
})
export class HealthModule {}
