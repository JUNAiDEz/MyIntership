## Node.js Backend

This service is an Express/Sequelize rewrite of the original Flask backend. The API surface mirrors the existing routes, including authentication, file uploads, products, services, service categories, and promotions.

### Structure

```
node-backend/
├─ src/
│  ├─ config/            # Database configuration
│  ├─ middleware/        # Shared middleware (JWT auth)
│  ├─ models/            # Sequelize models and associations
│  ├─ modules/           # Feature modules (controllers + routes)
│  ├─ app.js             # Express app bootstrap
│  └─ server.js          # Entry point
├─ uploads/              # Uploaded images (served as /uploads)
├─ .env.example          # Sample environment variables
└─ package.json
```

### Getting Started

1. Copy `.env.example` to `.env` and adjust credentials if needed (`DB_SYNC=true` can be set the first time to auto-create tables).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   or start normally with `npm start`.

The API is served on port `5000` by default. Static files are available under `/uploads`.
