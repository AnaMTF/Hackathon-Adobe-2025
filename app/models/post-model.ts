import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../lib/database';
import { User } from './user-model';

// Post attributes interface
export interface PostAttributes {
  uuid: string;
  authorUuid: string;
  title: string; // Post title
  body: string; // Post body/content
  image?: string | null; // Optional base64 image
  code?: string | null; // Optional code snippet
  timestamp: Date; // When the post was created
  createdAt?: Date;
  updatedAt?: Date;
}

// Optional attributes for creation
type PostCreationAttributes = Optional<PostAttributes, 'uuid' | 'image' | 'code' | 'timestamp' | 'createdAt' | 'updatedAt'>;

// Post model class - DO NOT declare public fields, they shadow Sequelize getters/setters
export class Post extends Model<PostAttributes, PostCreationAttributes> implements PostAttributes {
  declare uuid: string;
  declare authorUuid: string;
  declare title: string;
  declare body: string;
  declare image?: string | null;
  declare code?: string | null;
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
    title: {
      type: DataTypes.STRING(120),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 120],
      },
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    image: {
      type: DataTypes.TEXT, // Base64 image data
      allowNull: true,
      validate: {
        isValidImage(value: string | null) {
          if (value && !value.startsWith('data:image')) {
            throw new Error('Image must be a valid base64 data URL');
          }
        },
      },
    },
    code: {
      type: DataTypes.TEXT,
      allowNull: true,
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
