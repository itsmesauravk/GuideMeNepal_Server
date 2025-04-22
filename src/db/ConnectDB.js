
// import Sequelize from 'sequelize';
// import dotenv from 'dotenv';
// dotenv.config();

// // console.log(process.env.DB_HOST, process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD);


// if (!process.env.DB_NAME || !process.env.DB_USER  || !process.env.DB_HOST) {
//   throw new Error('Missing database configuration in environment variables');
// }

// const sequelize = new Sequelize(
//   process.env.DB_NAME,
//   process.env.DB_USER,
//   process.env.DB_PASSWORD,
//   {
//     host: process.env.DB_HOST,
//     port: parseInt(process.env.DB_PORT, 10) || 5432,
//     dialect: 'postgres',
//     dialectOptions:{
//       ssl: {
//         rejectUnauthorized: true,
//         ca:process.env.DB_CA_CERT || undefined, 
//     },
    
// },
//     logging: false,
    
//   }
// );

// export {sequelize};


import Sequelize from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.DB_NAME || !process.env.DB_USER || !process.env.DB_HOST) {
  throw new Error('Missing database configuration in environment variables');
}

const useSSL = !!process.env.DB_CA_CERT;

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    dialect: 'postgres',
    dialectOptions: useSSL
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false, 
            ca: process.env.DB_CA_CERT,
          },
        }
      : {},
    logging: false,
  }
);

export { sequelize };
