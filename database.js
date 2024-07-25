const Database = require('better-sqlite3');
const path = require('path');

// Define the path to the SQLite database file in the writable /tmp directory
const dbPath = path.join('/tmp', 'database.sqlite');
const db = new Database(dbPath);

const dropTables = `
DROP TABLE IF EXISTS Students;
DROP TABLE IF EXISTS Config;
`;

const createTables = `
CREATE TABLE IF NOT EXISTS Config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  month TEXT,
  postings TEXT,
  allposting TEXT
);

CREATE TABLE IF NOT EXISTS Students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  post1 TEXT,
  post2 TEXT,
  post3 TEXT,
  post4 TEXT,
  post5 TEXT,
  post6 TEXT
);
`;

// Drop existing tables and create fresh ones
db.exec(dropTables);
db.exec(createTables);

module.exports = db;
