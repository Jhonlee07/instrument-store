require('dotenv').config();
const mysql = require('mysql2/promise');
const { createApp } = require('./app');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

const port = process.env.PORT || 3000;
createApp(pool).listen(port, () => console.log(`Backend listening on port ${port}`));
