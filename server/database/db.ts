import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';

export interface DatabaseService {
  db: any;
  save: () => void;
  run: (sql: string, params?: any[]) => any;
  query: (sql: string, params?: any[]) => any[];
  get: (sql: string, params?: any[]) => any;
}

let dbInstance: any = null;
const DB_FILE = path.resolve(process.cwd(), 'contentforge.sqlite');

export async function getDatabase(): Promise<DatabaseService> {
  if (dbInstance) {
    return dbInstance;
  }

  const SQL = await initSqlJs();
  let db: any;

  if (fs.existsSync(DB_FILE)) {
    try {
      const fileBuffer = fs.readFileSync(DB_FILE);
      db = new SQL.Database(fileBuffer);
    } catch (e) {
      console.warn('Failed to load existing SQLite database, creating new one', e);
      db = new SQL.Database();
    }
  } else {
    db = new SQL.Database();
  }

  const save = () => {
    try {
      const data = db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(DB_FILE, buffer);
    } catch (err) {
      console.error('Error saving SQLite DB:', err);
    }
  };

  const run = (sql: string, params: any[] = []) => {
    db.run(sql, params);
    save();
  };

  const query = (sql: string, params: any[] = []): any[] => {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const results: any[] = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  };

  const get = (sql: string, params: any[] = []): any => {
    const results = query(sql, params);
    return results.length > 0 ? results[0] : null;
  };

  // Tables for focused Event -> Attend -> Feedback -> AI generation workflow
  db.run(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      location TEXT NOT NULL,
      speaker TEXT NOT NULL,
      topics TEXT,
      image_url TEXT,
      attended INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS feedbacks (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      feedback_text TEXT NOT NULL,
      rating INTEGER DEFAULT 5,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events (id)
    );

    CREATE TABLE IF NOT EXISTS generated_content (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      feedback_id TEXT,
      platform TEXT NOT NULL,
      style TEXT NOT NULL,
      hook TEXT NOT NULL,
      content TEXT NOT NULL,
      hashtags TEXT,
      cta TEXT,
      score_authenticity INTEGER DEFAULT 95,
      score_engagement INTEGER DEFAULT 90,
      score_platform_fit INTEGER DEFAULT 92,
      why_this_works TEXT,
      saved INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  save();

  dbInstance = { db, save, run, query, get };
  return dbInstance;
}
