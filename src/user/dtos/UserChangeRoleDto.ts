import {ApiProperty} from "@nestjs/swagger";
import {Role} from "@prisma/client";

export class UserChangeRoleDto{
  @ApiProperty(
    {
      description: 'The user id',
      type: Number,
      example: 10
    }
  )
  userId: number;

  @ApiProperty(
    {
      description: 'The role of the user',
      type: String,
      example: 'ADMIN'
    }
  )
  role: Role;
}