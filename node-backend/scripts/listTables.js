const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: '127.0.0.1',
  port: 3308,
  user: 'root',
  password: '', // ใส่รหัสผ่าน MySQL ของคุณ
  database: 'test_db'
});

connection.connect();

connection.query('SHOW TABLES;', (err, results) => {
  if (err) {
    console.error('Error showing tables:', err);
    process.exit(1);
  }
  console.log('Tables in test_db:');
  results.forEach(row => {
    console.log(Object.values(row)[0]);
  });
  connection.end();
});
