import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    // Set the DATABASE_URL to the test database URL
    process.env.DATABASE_URL =
      'postgresql://supabase_admin:password@localhost:5432/supabase_db';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule], // Ensure AppModule is correctly configured
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Start the application
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Reset the database before each test
    await prisma.$executeRaw`TRUNCATE TABLE "User" CASCADE;`;
  });

  describe('/user/register (POST)', () => {
    it('should register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/user/register')
        .send({ username: 'testuser', password: 'password123' })
        .expect(201);

      expect(response.body).toMatchObject({
        username: 'testuser',
        role: Role.ADMIN, // First user is an ADMIN
      });

      const users = await prisma.user.findMany();
      expect(users).toHaveLength(1);
    });

    it('should fail to register if username is missing', async () => {
      await request(app.getHttpServer())
        .post('/user/register')
        .send({ password: 'password123' })
        .expect(400);
    });
  });

  describe('/user/login (POST)', () => {
    it('should login a user and return a JWT', async () => {
      await prisma.user.create({
        data: {
          username: 'testuser',
          password_hash: await bcrypt.hash('password123', 10),
          role: Role.ADMIN,
        },
      });

      const response = await request(app.getHttpServer())
        .post('/user/login')
        .send({ username: 'testuser', password: 'password123' })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
    });

    it('should fail to login with invalid credentials', async () => {
      await request(app.getHttpServer())
        .post('/user/login')
        .send({ username: 'wronguser', password: 'wrongpassword' })
        .expect(400);
    });
  });

  describe('/user/all (GET)', () => {
    it('should return all users (admin only)', async () => {
      const token = await createTestUserAndGetToken(app, prisma, Role.ADMIN);

      const response = await request(app.getHttpServer())
        .get('/user/all')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({ username: 'testuser' });
    });

    it('should return 401 if not authenticated', async () => {
      await request(app.getHttpServer()).get('/user/all').expect(401);
    });
  });

  describe('/user/role (POST)', () => {
    it("should change a user's role (admin only)", async () => {
      const token = await createTestUserAndGetToken(app, prisma, Role.ADMIN);

      const user = await prisma.user.create({
        data: {
          username: 'testuser2',
          password_hash: await bcrypt.hash('password123', 10),
          role: Role.NONE,
        },
      });

      const response = await request(app.getHttpServer())
        .post('/user/role')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: user.user_id, role: Role.ADMIN })
        .expect(200);

      expect(response.body).toMatchObject({ role: Role.ADMIN });
    });

    it('should return 401 if not authenticated', async () => {
      await request(app.getHttpServer()).post('/user/role').expect(401);
    });

    it('should return 401 if non-admin attempts to change roles', async () => {
      const token = await createTestUserAndGetToken(app, prisma, Role.NONE);

      await request(app.getHttpServer())
        .post('/user/role')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: 1, role: Role.ADMIN })
        .expect(401);
    });
  });
});

// Helper to create a test user and return a token
async function createTestUserAndGetToken(
  app: INestApplication,
  prisma: PrismaService,
  role: Role,
): Promise<string> {
  const passwordHash = await bcrypt.hash('password123', 10);
  await prisma.user.create({
    data: {
      username: 'testuser',
      password_hash: passwordHash,
      role: role,
    },
  });

  const response = await request(app.getHttpServer())
    .post('/user/login')
    .send({ username: 'testuser', password: 'password123' });

  return response.body.accessToken;
}
