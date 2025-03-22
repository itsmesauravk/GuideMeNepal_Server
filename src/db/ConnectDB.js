
import Sequelize from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

// console.log(process.env.DB_HOST, process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD);


if (!process.env.DB_NAME || !process.env.DB_USER  || !process.env.DB_HOST) {
  throw new Error('Missing database configuration in environment variables');
}

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false
  }
);

export {sequelize};