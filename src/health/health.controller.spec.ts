import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthCheckService } from '@nestjs/terminus';
import { PrismaHealthIndicator } from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';

describe('HealthController', () => {
  let controller: HealthController;
  let mockHealthCheckService: Partial<HealthCheckService>;
  let mockS3Service: Partial<S3Service>;

  beforeEach(async () => {
    mockHealthCheckService = {
      check: jest.fn().mockResolvedValue({
        status: 'ok',
        details: {
          prisma: { status: 'up' },
          s3: { status: 'up' },
        },
      }),
    };

    const mockPrismaHealthIndicator = {
      pingCheck: jest.fn().mockResolvedValue({ prisma: { status: 'up' } }),
    };

    const mockPrismaService = {};

    mockS3Service = {
      checkHealth: jest.fn().mockResolvedValue({ status: 'up' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: HealthCheckService, useValue: mockHealthCheckService },
        { provide: PrismaHealthIndicator, useValue: mockPrismaHealthIndicator },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: S3Service, useValue: mockS3Service },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return health check status', async () => {
    const result = await controller.check();
    expect(result).toBeDefined();
    expect(result).toEqual({
      status: 'ok',
      details: {
        prisma: { status: 'up' },
        s3: { status: 'up' },
      },
    });
  });
});
