const path = require('path');

// Load .env from backend directory (only works locally, Vercel uses dashboard env vars)
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });

const app = require('../backend/server');

module.exports = app;
