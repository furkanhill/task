import { Sequelize } from 'sequelize';
import dbConfig from './database.config.js';

const env = (process.env.NODE_ENV || 'development') as 'development' | 'test' | 'production';
const config = dbConfig[env];

const sequelize = new Sequelize(
  config.database!,
  config.username!,
  config.password!,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect as 'postgres',
    logging: config.logging as boolean | ((sql: string) => void),
    pool: config.pool,
    define: config.define,
    dialectOptions: config.dialectOptions
  }
);

export default sequelize;

