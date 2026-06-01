const { Sequelize } = require('sequelize');
require('dotenv').config();

const usarUrl = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim());

const sequelize = usarUrl
  ? new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      // Supabase requiere SSL para conexiones externas
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  })
  : new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
      dialect: 'postgres'
    }
  );

module.exports = sequelize;
