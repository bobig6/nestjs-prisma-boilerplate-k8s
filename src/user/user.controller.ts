import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserLoginDto } from './dtos/UserLoginDto';
import { UserService } from './user.service';
import { UserCreateDto } from './dtos/UserCreateDto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserChangeRoleDto } from './dtos/UserChangeRoleDto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // register a new user
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiOkResponse({ description: 'User registered successfully' })
  @ApiBadRequestResponse({ description: 'Creating User Failed' })
  @ApiBody({ type: UserCreateDto })
  async register(@Body() data: UserCreateDto) {
    try {
      return await this.userService.create(data);
    } catch (e) {
      throw new HttpException('Creating User Failed', HttpStatus.BAD_REQUEST);
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login a user' })
  @ApiOkResponse({ description: 'User logged in successfully' })
  @ApiBadRequestResponse({ description: 'Invalid credentials' })
  @ApiBody({ type: UserLoginDto })
  async login(@Body() data: UserLoginDto) {
    try {
      const token = await this.userService.login(data);
      return { accessToken: token }; // Ensure the response includes a property like 'accessToken'
    } catch (e) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }
  }

  // get all users
  @Get('all')
  @ApiOperation({ summary: 'Get all users' })
  @ApiOkResponse({ description: 'Users found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  async getAll() {
    return this.userService.getAll();
  }

  @Post('role')
  @HttpCode(HttpStatus.OK) // Add this decorator
  @ApiOperation({ summary: "Change a user's role" })
  @ApiOkResponse({ description: 'User role changed' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({ description: 'Invalid user' })
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  async changeRole(@Body() data: UserChangeRoleDto) {
    try {
      return await this.userService.changeRole(data.userId, data.role);
    } catch (e) {
      throw new HttpException('Invalid user', HttpStatus.BAD_REQUEST);
    }
  }
}
