const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');

dotenv.config();

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '3306', 10);
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : (process.env.DB_PASS !== undefined ? process.env.DB_PASS : '');
const dbName = process.env.DB_NAME || 'codeforge';

const sequelize = new Sequelize(
  dbName,
  dbUser,
  dbPassword,
  {
    host: dbHost,
    port: dbPort,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 150,
      min: 0,
      acquire: 60000,
      idle: 10000
    }
  }
);

const connectDB = async () => {
  // Step 1: Attempt to create database if it doesn't already exist
  try {
    const conn = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword
    });
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await conn.end();
  } catch (preErr) {
    console.log('Database pre-check notice:', preErr.message);
  }

  // Step 2: Authenticate with Sequelize
  try {
    await sequelize.authenticate();
    console.log('Connected to MySQL via Sequelize');
  } catch (error) {
    console.error('MySQL connection error:', error.message);
  }
};

module.exports = { sequelize, connectDB };
