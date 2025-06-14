const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,      // eramdb_user ✔
  host: process.env.DB_HOST,      // dpg-…render.com ✔
  database: process.env.DB_NAME,  // debería ser eramdb, NO eramdb_user
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false },
});

module.exports = pool;