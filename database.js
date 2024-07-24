const Database = require('better-sqlite3');
const db = new Database('database.sqlite');

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
