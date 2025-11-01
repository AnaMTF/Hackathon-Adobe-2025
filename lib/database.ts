import { Sequelize } from 'sequelize';

// Create SQLite database connection
export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false, // Set to console.log to see SQL queries
});

// Test the connection
export async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

// Sync all models
export async function syncDB() {
  try {
    await sequelize.sync({ force: false }); // Set force: true to drop and recreate tables
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Unable to sync database:', error);
  }
}