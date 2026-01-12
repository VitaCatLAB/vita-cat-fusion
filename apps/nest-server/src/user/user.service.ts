import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AppService } from '../app.service';

@Injectable()
export class UserService {
  constructor(private readonly appService: AppService) {}

  async createUser(username: string, password: string) {
    const db = this.appService.getDatabase();

    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);

    if (existing) {
      throw new Error('用户名已存在');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = db
      .prepare(
        `INSERT INTO users (username, password)
         VALUES (?, ?)`,
      )
      .run(username, hashedPassword);

    return {
      id: result.lastInsertRowid,
      username,
    };
  }

  /** 🔐 登录 */
  async login(username: string, password: string) {
    const db = this.appService.getDatabase();

    const user: any = db
      .prepare(
        `SELECT id, username, password
         FROM users
         WHERE username = ?`,
      )
      .get(username);

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    return {
      id: user.id,
      username: user.username,
    };
  }
}
