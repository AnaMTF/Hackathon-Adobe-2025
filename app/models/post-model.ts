import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../lib/database';
import { User } from './user-model';

// Event interface for nested object
export interface EventInfo {
  location: string;
  time: Date;
}

// Post attributes interface
export interface PostAttributes {
  uuid: string;
  authorUuid: string;
  poze: string[]; // Array of base64 image data (max 3)
  text: string; // Max 256 characters
  codeSnippet?: string | null; // Optional code snippet text
  timestamp: Date; // When the post was created
  createdAt?: Date;
  updatedAt?: Date;
}

// Optional attributes for creation
type PostCreationAttributes = Optional<PostAttributes, 'uuid' | 'timestamp' | 'createdAt' | 'updatedAt'>;

// Post model class - DO NOT declare public fields, they shadow Sequelize getters/setters
export class Post extends Model<PostAttributes, PostCreationAttributes> implements PostAttributes {
  declare uuid: string;
  declare authorUuid: string;
  declare poze: string[];
  declare text: string;
  declare codeSnippet?: string | null;
  declare timestamp: Date;

  // Timestamps
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // Association methods
  declare getAuthor: () => Promise<User>;
  declare setAuthor: (user: User) => Promise<void>;
}

// Initialize the Post model
Post.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    authorUuid: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'uuid',
      },
    },
    poze: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      validate: {
        isValidPhotos(value: string[]) {
          if (!Array.isArray(value)) {
            throw new Error('Poze must be an array');
          }
          if (value.length > 3) {
            throw new Error('Maximum 3 photos allowed');
          }
          // Validate each item is a string (base64 data or empty)
          value.forEach((item, index) => {
            if (typeof item !== 'string') {
              throw new Error(`Photo at index ${index} must be a string`);
            }
            // If not empty, should start with data:image or be a valid base64
            if (item && !item.startsWith('data:image')) {
              throw new Error(`Photo at index ${index} must be a valid base64 data URL`);
            }
          });
        },
      },
    },
    text: {
      type: DataTypes.STRING(256),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 256],
      },
    },
    codeSnippet: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        isStringOrNull(value: string | null) {
          if (value !== null && typeof value !== 'string') {
            throw new Error('codeSnippet must be a string or null');
          }
        },
      },
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Post',
    tableName: 'posts',
    timestamps: true,
  }
);

// Define associations
Post.belongsTo(User, {
  foreignKey: 'authorUuid',
  as: 'author',
});

User.hasMany(Post, {
  foreignKey: 'authorUuid',
  as: 'posts',
});

// Import and setup associations with post interactions
// These will be properly initialized after all models are loaded
import { PostLike, PostComment, PostFavorite } from './post-interactions';

Post.hasMany(PostLike, {
  foreignKey: 'postUuid',
  as: 'likes',
});

Post.hasMany(PostComment, {
  foreignKey: 'postUuid',
  as: 'comments',
});

Post.hasMany(PostFavorite, {
  foreignKey: 'postUuid',
  as: 'favorites',
});

export default Post;
