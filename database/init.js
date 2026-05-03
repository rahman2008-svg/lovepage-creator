const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(
  path.join(__dirname, 'lovepage.db')
);

// Create tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      image_url TEXT,
      music_url TEXT,
      theme TEXT DEFAULT 'default',
      views INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = db;
