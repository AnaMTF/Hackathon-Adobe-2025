import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../lib/database';
import { User } from './user-model';

// Message attributes interface
export interface MessageAttributes {
  uuid: string;
  senderUuid: string;
  recipientUuid: string;
  text: string;
  read: Date | null; // Timestamp when read, or NULL if unread
  createdAt?: Date;
  updatedAt?: Date;
}

// Optional attributes for creation
type MessageCreationAttributes = Optional<MessageAttributes, 'uuid' | 'read' | 'createdAt' | 'updatedAt'>;

// Message model class - DO NOT declare public fields, they shadow Sequelize getters/setters
export class Message extends Model<MessageAttributes, MessageCreationAttributes> implements MessageAttributes {
  declare uuid: string;
  declare senderUuid: string;
  declare recipientUuid: string;
  declare text: string;
  declare read: Date | null;

  // Timestamps
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // Association methods
  declare getSender: () => Promise<User>;
  declare setSender: (user: User) => Promise<void>;
  declare getRecipient: () => Promise<User>;
  declare setRecipient: (user: User) => Promise<void>;
}

// Initialize the Message model
Message.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    senderUuid: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'uuid',
      },
    },
    recipientUuid: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'uuid',
      },
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Message text cannot be empty',
        },
      },
    },
    read: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'messages',
    timestamps: true,
    indexes: [
      {
        fields: ['senderUuid'],
      },
      {
        fields: ['recipientUuid'],
      },
      {
        fields: ['createdAt'],
      },
    ],
  }
);

// Define associations
Message.belongsTo(User, {
  foreignKey: 'senderUuid',
  as: 'sender',
});

Message.belongsTo(User, {
  foreignKey: 'recipientUuid',
  as: 'recipient',
});

// Export the model
export default Message;
