import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  createUser(@Body('username') username: string, @Body('password') password: string) {
    return this.userService.createUser(username, password);
  }

  /** 🔐 登录接口 */
  @Post('login')
  login(@Body('username') username: string, @Body('password') password: string) {
    return this.userService.login(username, password);
  }
}
