const path = require('path');
const dotenv = require('dotenv');

// ✅ 1. โหลดไฟล์ Env
dotenv.config({ path: path.resolve(__dirname, '../.env.example') });

// ✅ 2. require app หลังจากโหลด env
const { app, initializeDatabase } = require('./app');

// ✅ แก้ไขตรงนี้: เปลี่ยน Default จาก 5000 เป็น 4000 ให้ตรงกับ Nginx ของคุณ
const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    // 1. เชื่อมต่อฐานข้อมูล
    await initializeDatabase();

    // 2. เริ่มต้น Server
    const server = app.listen(PORT, () => {
      console.log(`=================================`);
      console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`📂 Loaded Config from: .env.example`);
      console.log(`🔊 Listening on port ${PORT}`); // เช็คตรงนี้ว่าขึ้น 4000 ไหม
      console.log(`🔗 http://localhost:${PORT}`);
      console.log(`=================================`);
    });

    // 3. Graceful Shutdown Helper
    const exitHandler = () => {
      if (server) {
        server.close(() => {
          console.log('Server closed');
          process.exit(1); 
        });
      } else {
        process.exit(1);
      }
    };

    const unexpectedErrorHandler = (error) => {
      console.error('❌ Unexpected Error:', error);
      exitHandler();
    };

    process.on('uncaughtException', unexpectedErrorHandler);
    process.on('unhandledRejection', unexpectedErrorHandler);

    process.on('SIGTERM', () => {
      console.log('SIGTERM received');
      if (server) {
        server.close(); 
      }
    });
    
    process.on('SIGINT', () => {
      console.log('SIGINT received');
      if (server) {
        server.close(() => {
           console.log('Server closed gracefully');
           process.exit(0); 
        });
      }
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();