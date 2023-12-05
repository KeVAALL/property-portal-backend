// import { createPool } from 'mysql';
// import dotenv from "dotenv";

const { createPool } = require("mysql");
const dotenv = require("dotenv");

dotenv.config();

const pool = createPool({
  // connectionLimit: 10,
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  timezone: process.env.TZ,
});

module.exports = pool;
