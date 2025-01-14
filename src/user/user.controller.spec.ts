import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthGuard } from '../guards/auth.guard';
import { UserCreateDto } from './dtos/UserCreateDto';
import { UserLoginDto } from './dtos/UserLoginDto';
import { UserChangeRoleDto } from './dtos/UserChangeRoleDto';
import { Role } from '@prisma/client';

jest.mock('./user.service');

describe('UserController', () => {
  let controller: UserController;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            create: jest.fn(),
            login: jest.fn(),
            getAll: jest.fn(),
            changeRole: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<UserController>(UserController);
    userService = module.get(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const dto: UserCreateDto = { username: 'test', password: 'test123' };
      userService.create.mockResolvedValue({
        user_id: 1,
        username: 'test',
        password_hash: 'hash',
        role: Role.NONE,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const result = await controller.register(dto);

      expect(userService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual({
        user_id: 1,
        username: 'test',
        password_hash: 'hash',
        role: Role.NONE,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      });
    });

    it('should throw an error if registration fails', async () => {
      const dto: UserCreateDto = { username: 'test', password: 'test123' };
      userService.create.mockRejectedValue(new Error());

      await expect(controller.register(dto)).rejects.toThrow(
        'Creating User Failed',
      );
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      const dto: UserLoginDto = { username: 'test', password: 'test123' };
      userService.login.mockResolvedValue('token123');

      const result = await controller.login(dto);

      expect(userService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ accessToken: 'token123' });
    });

    it('should throw an error if login fails', async () => {
      const dto: UserLoginDto = { username: 'test', password: 'test123' };
      userService.login.mockRejectedValue(new Error());

      await expect(controller.login(dto)).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });

  describe('getAll', () => {
    it('should return all users', async () => {
      userService.getAll.mockResolvedValue([
        {
          user_id: 1,
          username: 'test',
          password_hash: 'hash',
          role: Role.NONE,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]);

      const result = await controller.getAll();

      expect(userService.getAll).toHaveBeenCalled();
      expect(result).toEqual([
        {
          user_id: 1,
          username: 'test',
          password_hash: 'hash',
          role: Role.NONE,
          created_at: expect.any(Date),
          updated_at: expect.any(Date),
        },
      ]);
    });
  });

  describe('changeRole', () => {
    it('should change the role of a user', async () => {
      const dto: UserChangeRoleDto = { userId: 1, role: Role.ADMIN };
      userService.changeRole.mockResolvedValue({
        user_id: 1,
        username: 'test',
        password_hash: 'hash',
        role: Role.ADMIN,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const result = await controller.changeRole(dto);

      expect(userService.changeRole).toHaveBeenCalledWith(1, Role.ADMIN);
      expect(result).toEqual({
        user_id: 1,
        username: 'test',
        password_hash: 'hash',
        role: Role.ADMIN,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      });
    });

    it('should throw an error if role change fails', async () => {
      const dto: UserChangeRoleDto = { userId: 1, role: Role.ADMIN };
      userService.changeRole.mockRejectedValue(new Error());

      await expect(controller.changeRole(dto)).rejects.toThrow('Invalid user');
    });
  });
});
