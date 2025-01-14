import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { UserCreateDto } from './dtos/UserCreateDto';
import { UserLoginDto } from './dtos/UserLoginDto';

jest.mock('@nestjs/jwt');

describe('UserService', () => {
  let userService: UserService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('getById', () => {
    it('should return a user by ID', async () => {
      const mockUser = {
        user_id: 1,
        username: 'gosho',
        password_hash: 'hash',
        role: Role.NONE,
        created_at: new Date(),
        updated_at: new Date(),
      };
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

      const result = await userService.getById(1);
      expect(result).toEqual(mockUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { user_id: 1 },
      });
    });
  });

  describe('getAll', () => {
    it('should return all users', async () => {
      const mockUsers = [
        {
          user_id: 1,
          username: 'gosho',
          password_hash: 'hash',
          role: Role.NONE,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(mockUsers);

      const result = await userService.getAll();
      expect(result).toEqual(mockUsers);
      expect(prismaService.user.findMany).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a new user and set role to ADMIN if no users exist', async () => {
      const userDto: UserCreateDto = { username: 'gosho', password: '123456' };
      const mockCreatedUser = {
        user_id: 1,
        username: 'gosho',
        password_hash: 'hashed_password',
        role: Role.ADMIN,
        created_at: new Date(),
        updated_at: new Date(),
      };
      jest.spyOn(userService, 'getAll').mockResolvedValue([]);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed_password' as never);
      jest
        .spyOn(prismaService.user, 'create')
        .mockResolvedValue(mockCreatedUser);

      const result = await userService.create(userDto);
      expect(result).toEqual(mockCreatedUser);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          username: 'gosho',
          password_hash: 'hashed_password',
          role: Role.ADMIN,
        },
      });
    });

    it('should set role to NONE if users exist', async () => {
      const userDto: UserCreateDto = { username: 'pesho', password: '123456' };
      const mockExistingUsers = [
        {
          user_id: 1,
          username: 'gosho',
          password_hash: 'hash',
          role: Role.ADMIN,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];
      const mockCreatedUser = {
        user_id: 2,
        username: 'pesho',
        password_hash: 'hashed_password',
        role: Role.NONE,
        created_at: new Date(),
        updated_at: new Date(),
      };
      jest.spyOn(userService, 'getAll').mockResolvedValue(mockExistingUsers);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed_password' as never);
      jest
        .spyOn(prismaService.user, 'create')
        .mockResolvedValue(mockCreatedUser);

      const result = await userService.create(userDto);
      expect(result).toEqual(mockCreatedUser);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          username: 'pesho',
          password_hash: 'hashed_password',
          role: Role.NONE,
        },
      });
    });
  });

  describe('login', () => {
    it('should return a signed JWT if credentials are valid', async () => {
      const userLoginDto: UserLoginDto = {
        username: 'gosho',
        password: '123456',
      };
      const mockUser = {
        user_id: 1,
        username: 'gosho',
        password_hash: 'hashed_password',
        role: Role.NONE,
        created_at: new Date(),
        updated_at: new Date(),
      };
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      jest.spyOn(jwtService, 'sign').mockReturnValue('mockToken');

      const result = await userService.login(userLoginDto);
      expect(result).toEqual('mockToken');
      expect(jwtService.sign).toHaveBeenCalledWith({
        username: 'gosho',
        userID: 1,
        role: Role.NONE,
      });
    });

    it('should throw an error if username is invalid', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(null);

      await expect(
        userService.login({
          username: 'invalid',
          password: '123456',
        }),
      ).rejects.toThrow('Invalid username or password');
    });

    it('should throw an error if password is invalid', async () => {
      const mockUser = {
        user_id: 1,
        username: 'gosho',
        password_hash: 'hashed_password',
        role: Role.NONE,
        created_at: new Date(),
        updated_at: new Date(),
      };
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(
        userService.login({
          username: 'gosho',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow('Invalid username or password');
    });
  });

  describe('changeRole', () => {
    it('should update the role of a user', async () => {
      const mockUpdatedUser = {
        user_id: 1,
        username: 'gosho',
        password_hash: 'hash',
        role: Role.ADMIN,
        created_at: new Date(),
        updated_at: new Date(),
      };
      jest
        .spyOn(prismaService.user, 'update')
        .mockResolvedValue(mockUpdatedUser);

      const result = await userService.changeRole(1, Role.ADMIN);
      expect(result).toEqual(mockUpdatedUser);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { user_id: 1 },
        data: { role: Role.ADMIN },
      });
    });
  });
});
