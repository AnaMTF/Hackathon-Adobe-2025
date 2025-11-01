// comment-model.ts
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../lib/database';
import { User } from './user-model';
import { Post } from './post-model';

export interface CommentAttributes {
  uuid: string;
  postUuid: string;
  authorUuid: string;
  text: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type CommentCreationAttributes = Optional<CommentAttributes, 'uuid' | 'createdAt' | 'updatedAt'>;

export class Comment extends Model<CommentAttributes, CommentCreationAttributes> implements CommentAttributes {
  declare uuid: string;
  declare postUuid: string;
  declare authorUuid: string;
  declare text: string;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare getAuthor: () => Promise<User>;
  declare getPost: () => Promise<Post>;
}

Comment.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    postUuid: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: Post, key: 'uuid' },
    },
    authorUuid: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: User, key: 'uuid' },
    },
    text: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: { notEmpty: true },
    },
  },
  {
    sequelize,
    modelName: 'Comment',
    tableName: 'comments',
    timestamps: true,
  }
);

// Associations
Comment.belongsTo(User, { foreignKey: 'authorUuid', as: 'author' });
User.hasMany(Comment, { foreignKey: 'authorUuid', as: 'comments' });

Comment.belongsTo(Post, { foreignKey: 'postUuid', as: 'post' });
Post.hasMany(Comment, { foreignKey: 'postUuid', as: 'comments' });

export default Comment;
