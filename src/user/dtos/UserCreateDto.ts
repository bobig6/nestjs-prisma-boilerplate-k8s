import {ApiProperty} from "@nestjs/swagger";

export class UserCreateDto {
  @ApiProperty(
    {
      description: 'The username of the user',
      type: String,
      example: 'gosho'
    }
  )
  username: string;

  @ApiProperty(
    {
      description: 'The password of the user',
      type: String,
      example: '123456'
    }
  )
  password: string;
}