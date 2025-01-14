import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, User } from '@prisma/client';
import { UserCreateDto } from './dtos/UserCreateDto';
import * as bcrypt from 'bcryptjs';
import { UserLoginDto } from './dtos/UserLoginDto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async getById(id: number): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: {
        user_id: id,
      },
    });
  }

  async getAll() {
    return this.prismaService.user.findMany();
  }

  async create(data: UserCreateDto) {
    // Get all users to determine the role for the new user
    const users = await this.getAll();
    const role = users.length === 0 ? Role.ADMIN : Role.NONE;

    // Hash the password
    const hashedPassword = await this.hashPassword(data.password);

    // Ensure the username is passed correctly
    return this.prismaService.user.create({
      data: {
        username: data.username,
        password_hash: hashedPassword,
        role: role,
      },
    });
  }

  // function to hash the password
  async hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }

  // function to login a user
  async login(data: UserLoginDto) {
    const user = await this.prismaService.user.findFirst({
      where: {
        username: data.username,
      },
    });

    if (!user) {
      throw new Error('Invalid username or password');
    }

    const valid = await this.comparePassword(data.password, user.password_hash);

    if (!valid) {
      throw new Error('Invalid username or password');
    }

    const payload = {
      username: user.username,
      userID: user.user_id,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }

  // function to compare the password
  async comparePassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }

  async changeRole(userId: number, role: Role) {
    return this.prismaService.user.update({
      where: {
        user_id: userId,
      },
      data: {
        role: role,
      },
    });
  }
}
