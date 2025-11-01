import { Sequelize } from 'sequelize';
import * as sqlite3 from 'sqlite3';

// Create SQLite database connection
export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false,
  // Explicitly tell Sequelize which sqlite3 driver to use so bundlers resolve it correctly
  dialectModule: sqlite3,
});

// Import all models to ensure they're registered with Sequelize
// This must happen before any sync operations
let modelsImported = false;
async function importAllModels() {
  if (modelsImported) return;
  
  // Import all model files to register them with Sequelize
  await import('../app/models/user-model');
  await import('../app/models/post-model');
  await import('../app/models/post-interactions');
  await import('../app/models/event-model');
  await import('../app/models/message-model');
  
  modelsImported = true;
  console.log('All models imported and registered.');
}

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
    // Ensure all models are imported before syncing
    await importAllModels();
    
    await sequelize.sync({ force: false });
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Unable to sync database:', error);
  }
}

// Initialize database and export
export async function initializeDatabase() {
  await connectDB();
  await syncDB();
}

// Idempotent, awaited DB bootstrap for request handlers
let dbReadyPromise: Promise<void> | null = null;
export function ensureDbReady(): Promise<void> {
  if (!dbReadyPromise) {
    dbReadyPromise = (async () => {
      await connectDB();
      await syncDB();
    })();
  }
  return dbReadyPromise;
}