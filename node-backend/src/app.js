const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const helmet = require('helmet');

const db = require('./models'); 
const apiRoutes = require('./modules');

const app = express();

// ====================================================
// 1. Global Middleware
// ==========================4==========================

// ✅ 1. ตั้งค่า CORS (อนุญาตให้ Fronteภ4nd เข้าถึงได้)
app.use(cors({
  origin: '*',
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','X-Requested-With'],
  credentials: false,
  optionsSuccessStatus: 200,
  maxAge: 86400
}));

// ✅ 2. Helmet (Security Headers)
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Request Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Body Parser - เพิ่ม limit สำหรับ Base64 images (50MB)
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// ====================================================
// 2. Static Files
// ====================================================
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// ====================================================
// 3. Routes Mounting
// ====================================================
app.get('/', (req, res) => {
    res.send('Garage Management API is running... 🚀');
});

app.use('/api', apiRoutes);

// ====================================================
// 4. Error Handling
// ====================================================

app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
});

app.use((err, req, res, next) => {
    // ถ้า Error มาจาก CORS ให้ส่ง 403 Forbidden
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({
            message: 'CORS Error: Origin not allowed',
            error: err.message
        });
    }

    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

// ====================================================
// 5. Database Initialization
// ====================================================
const initializeDatabase = async () => {
    try {
        await db.sequelize.authenticate();

        // 🔥 แก้ไขชั่วคราว: บังคับให้เป็น { alter: true } ไปเลยเพื่ออัปเดตฐานข้อมูล
        const syncOptions = { alter: true }; 
        
        // ✅ 3. สร้างเฉพาะตาราง BlogPosts (ถ้ายังไม่มี)
        if (db.BlogPost) {
            await db.BlogPost.sync(syncOptions);
            console.log("✅ BlogPost table synced and altered!");
        }

        // ✅ 4. สร้างเฉพาะตาราง Faqs (ถ้ายังไม่มี)
        if (db.Faq) {
            await db.Faq.sync(syncOptions);
        }

        // ✅ 5. สร้างเฉพาะตาราง ContactMessages (ถ้ายังไม่มี)
        if (db.ContactMessage) {
            await db.ContactMessage.sync(syncOptions);
        }

        // ✅ 6. สร้างเฉพาะตาราง ServiceBanners & ServiceButtons (ถ้ายังไม่มี)
        if (db.ServiceBanner) {
            await db.ServiceBanner.sync(syncOptions);
        }
        if (db.ServiceButton) {
            await db.ServiceButton.sync(syncOptions);
        }

        // Comment ไว้ก่อน เพราะมีปัญหากับตาราง Users
        // await db.sequelize.sync({ alter: false }); // ปิดการ Sync อัตโนมัติทั้งหมด
        
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        throw error;
    }
};

module.exports = { app, initializeDatabase };