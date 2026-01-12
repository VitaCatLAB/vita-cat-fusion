import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as Database from 'better-sqlite3';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  private db: Database.Database;

  private initTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }
  constructor() {
    console.log('os.homedir():', os.homedir());
    console.log('path.join function:', path.join);
    const dbDir = path.join(os.homedir(), '.nset-server-demo');
    const dbPath = path.join(dbDir, 'app.db');
    console.log('dbDir:', dbDir);
    // 如果目录不存在，就创建
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
      console.log('Created database directory:', dbDir);
    }

    this.db = new Database(dbPath);
    console.log('dbPath:', dbPath);
    this.db.pragma('journal_mode = WAL');
    this.initTables();
  }

  getHello(): string {
    return 'Hello World!';
  }

  getDatabase(): Database.Database {
    return this.db;
  }
}
