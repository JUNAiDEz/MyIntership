const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');

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

// ✅ 2.5 Gzip compression — ลดขนาด response (JSON/HTML) ก่อนส่ง
app.use(compression());

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

        // ⚙️ รัน sync/alter เฉพาะเมื่อสั่ง DB_SYNC=true เท่านั้น
        // บน production ควรเป็น false (boot เร็วขึ้น + ไม่เสี่ยง alter schema โดยไม่ตั้งใจ — ใช้ migration แทน)
        if (process.env.DB_SYNC === 'true') {
            const syncOptions = { alter: true };
            const tablesToSync = ['BlogPost', 'Faq', 'ContactMessage', 'ServiceBanner', 'ServiceButton'];
            for (const name of tablesToSync) {
                if (db[name]) await db[name].sync(syncOptions);
            }
            console.log('✅ DB_SYNC=true → synced/altered:', tablesToSync.filter((n) => db[n]).join(', '));
        } else {
            console.log('ℹ️  DB_SYNC ไม่ได้เปิด — ข้ามการ sync/alter (ใช้ schema เดิม)');
        }

    } catch (error) {
        console.error('❌ Database connection failed:', error);
        throw error;
    }
};

module.exports = { app, initializeDatabase };