import { sequelize, connectDB, syncDB, initializeDatabase as initDB } from '../../lib/database';
import User from './user-model';
import Post from './post-model';
import { PostLike, PostComment, PostFavorite } from './post-interactions';
import Event from './event-model';
import Message from './message-model';

// Export models
export { User, Post, PostLike, PostComment, PostFavorite, Event, Message };

// Export database utilities
export { sequelize, connectDB, syncDB };

// Initialize database connection and sync models
export async function initializeDatabase() {
  await initDB();
}

// Define all associations here (already defined in individual model files)
// This ensures all relationships are properly set up

const models = {
  User,
  Post,
  PostLike,
  PostComment,
  PostFavorite,
  Event,
  Message,
  sequelize,
  connectDB,
  syncDB,
  initializeDatabase,
};

export default models;