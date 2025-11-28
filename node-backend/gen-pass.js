// gen-pass.js
const bcrypt = require('bcryptjs');

const password = 'admin123!'; // <--- เปลี่ยนเป็นรหัสที่คุณต้องการใช้ Login
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);

console.log('====================================');
console.log('Password:', password);
console.log('Hash:', hash);
console.log('====================================');