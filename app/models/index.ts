import { sequelize, connectDB, syncDB } from '../../lib/database';
import User from './user-model';
import Post from './post-model';
import { PostLike, PostComment, PostFavorite } from './post-interactions';

// Export models
export { User, Post, PostLike, PostComment, PostFavorite };

// Export database utilities
export { sequelize, connectDB, syncDB };

// Initialize database connection and sync models
export async function initializeDatabase() {
  await connectDB();
  await syncDB();
}

// Define all associations here (already defined in individual model files)
// This ensures all relationships are properly set up

const models = {
  User,
  Post,
  PostLike,
  PostComment,
  PostFavorite,
  sequelize,
  connectDB,
  syncDB,
  initializeDatabase,
};

export default models;