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
// ====================================================

// ✅ 1. ตั้งค่า CORS (อนุญาตให้ Frontend เข้าถึงได้)
const allowedOrigins = [
    'https://front.gt7dev.com',
    'https://www.front.gt7dev.com',
    'https://apigame.gt7dev.com' // เผื่อไว้
];

// ถ้ามี Env ให้เอามาต่อท้าย Array เดิม
if (process.env.CORS_ORIGINS) {
    const envOrigins = process.env.CORS_ORIGINS.split(',');
    envOrigins.forEach(origin => allowedOrigins.push(origin.trim()));
}

const corsOptions = {
    origin: function (origin, callback) {
        // Log ดูว่าใครยิงเข้ามา (ช่วย Debug ได้มาก ดูใน PM2 logs)
        console.log('Incoming Origin:', origin); 

        // Allow requests with no origin (Mobile app, Curl, Postman)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        } else {
            // Log เมื่อ Block
            console.error(`Blocked by CORS: ${origin}`);
            return callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization','X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 200,
    maxAge: 86400 
};

// ใช้งาน CORS แบบ Global
app.use(cors(corsOptions));

// ✅ 2. Helmet (Security Headers)
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Request Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
        console.log('✅ Database connected successfully.');
        
        // ✅ 3. เปิดใช้งาน sync เพื่อสร้างตารางใน Database
        // หลังจากรันผ่านแล้ว แนะนำให้กลับมา comment ปิดไว้เหมือนเดิมในอนาคตครับ
        // await db.sequelize.sync({ alter: true }); 
        console.log('⚠️ Database Synced (Tables Created/Updated)');
        
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        throw error;
    }
};

module.exports = { app, initializeDatabase };