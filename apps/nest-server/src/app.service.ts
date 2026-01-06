import { Injectable } from '@nestjs/common';
import Database from 'better-sqlite3';
import path from 'path';
import os from 'os';
@Injectable()
export class AppService {
  private db: Database.Database;
  constructor() {
    const dbDir = path.join(os.homedir(), '.nset-server-demo');
    const dbPath = path.join(dbDir, 'app.db');

    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
  }
  getHello(): string {
    return 'Hello World!';
  }
  getDatabase(): Database.Database {
    return this.db;
  }
}
