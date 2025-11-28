const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');

const MIGRATION_FILE = path.join(__dirname, '../migrations/001_create_test_db_schema.sql');

const connection = mysql.createConnection({
  host: '127.0.0.1',
  port: 3308,
  user: 'root',
  password: 'kongvw159', // ใส่รหัสผ่าน MySQL ของคุณ
  database: 'test_db',
  multipleStatements: true
});

const migrationSQL = fs.readFileSync(MIGRATION_FILE, 'utf8');

connection.connect();

connection.query(migrationSQL, (err) => {
  if (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
  console.log('Migration applied successfully.');
  connection.end();
});
