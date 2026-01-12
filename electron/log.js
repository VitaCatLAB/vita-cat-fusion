import fs from 'fs';
import path from 'path';
import { app } from 'electron';
export function logMain(...args) {
    const logFile = path.join(app.getPath('userData'), 'main.log');
    const msg = `[${new Date().toISOString()}] ` +
        args.map((v) => (typeof v === 'string' ? v : JSON.stringify(v))).join(' ') +
        '\n';
    fs.appendFileSync(logFile, msg);
}
