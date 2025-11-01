import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../lib/database';

// PostLike attributes interface
export interface PostLikeAttributes {
  id: number;
  postUuid: string;
  userUuid: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Optional attributes for creation
type PostLikeCreationAttributes = Optional<PostLikeAttributes, 'id' | 'createdAt' | 'updatedAt'>;

// PostLike model class
export class PostLike extends Model<PostLikeAttributes, PostLikeCreationAttributes> implements PostLikeAttributes {
  public id!: number;
  public postUuid!: string;
  public userUuid!: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize the PostLike model
PostLike.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    postUuid: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'posts',
        key: 'uuid',
      },
    },
    userUuid: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'uuid',
      },
    },
  },
  {
    sequelize,
    modelName: 'PostLike',
    tableName: 'post_likes',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['postUuid', 'userUuid'], // Prevent duplicate likes
      },
    ],
  }
);

// PostComment attributes interface
export interface PostCommentAttributes {
  id: number;
  postUuid: string;
  userUuid: string;
  text: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Optional attributes for creation
type PostCommentCreationAttributes = Optional<PostCommentAttributes, 'id' | 'createdAt' | 'updatedAt'>;

// PostComment model class
export class PostComment extends Model<PostCommentAttributes, PostCommentCreationAttributes> implements PostCommentAttributes {
  public id!: number;
  public postUuid!: string;
  public userUuid!: string;
  public text!: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize the PostComment model
PostComment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    postUuid: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'posts',
        key: 'uuid',
      },
    },
    userUuid: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'uuid',
      },
    },
    text: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 500],
      },
    },
  },
  {
    sequelize,
    modelName: 'PostComment',
    tableName: 'post_comments',
    timestamps: true,
  }
);

// PostFavorite attributes interface
export interface PostFavoriteAttributes {
  id: number;
  postUuid: string;
  userUuid: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Optional attributes for creation
type PostFavoriteCreationAttributes = Optional<PostFavoriteAttributes, 'id' | 'createdAt' | 'updatedAt'>;

// PostFavorite model class
export class PostFavorite extends Model<PostFavoriteAttributes, PostFavoriteCreationAttributes> implements PostFavoriteAttributes {
  public id!: number;
  public postUuid!: string;
  public userUuid!: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize the PostFavorite model
PostFavorite.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    postUuid: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'posts',
        key: 'uuid',
      },
    },
    userUuid: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'uuid',
      },
    },
  },
  {
    sequelize,
    modelName: 'PostFavorite',
    tableName: 'post_favorites',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['postUuid', 'userUuid'], // Prevent duplicate favorites
      },
    ],
  }
);

const postInteractions = { PostLike, PostComment, PostFavorite };

export default postInteractions;