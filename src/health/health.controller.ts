import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';
import { ApiOperation } from '@nestjs/swagger';
import { S3Service } from '../s3/s3.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaHealth: PrismaHealthIndicator,
    private readonly prismaService: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({
    summary: 'Health check',
    description: 'Check the health of the application',
  })
  check() {
    return this.health.check([
      () =>
        this.prismaHealth.pingCheck('prisma', this.prismaService, {
          timeout: 10000,
        }),
      async () => {
        try {
          const s3Health = await this.s3Service.checkHealth();
          if (s3Health.status === 'up') {
            return { s3: { status: 'up' } };
          } else {
            throw new Error(s3Health.message);
          }
        } catch (e) {
          return { s3: { status: 'down', message: e.message } };
        }
      },
    ]);
  }
}
