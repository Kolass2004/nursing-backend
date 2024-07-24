const Database = require('better-sqlite3');
const path = require('path');

// Define the path to the SQLite database file in the writable /tmp directory
const dbPath = path.join('/tmp', 'database.sqlite');
const db = new Database(dbPath);

const createTable = `
CREATE TABLE IF NOT EXISTS Config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  month TEXT,
  postings TEXT,
  allposting TEXT
)
`;

db.exec(createTable);

module.exports = db;

