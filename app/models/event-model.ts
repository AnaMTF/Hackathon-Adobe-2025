import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../lib/database';
import { User } from './user-model';

// Event attributes interface
export interface EventAttributes {
  uuid: string;
  name: string;
  details?: string;
  date: Date;
  creatorUuid: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Optional attributes for creation (uuid will be auto-generated)
type EventCreationAttributes = Optional<EventAttributes, 'uuid' | 'details' | 'createdAt' | 'updatedAt'>;

// Event model class - DO NOT declare public fields, they shadow Sequelize getters/setters
export class Event extends Model<EventAttributes, EventCreationAttributes> implements EventAttributes {
  declare uuid: string;
  declare name: string;
  declare details?: string;
  declare date: Date;
  declare creatorUuid: string;

  // Timestamps
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // Association methods
  declare getCreator: () => Promise<User>;
  declare setCreator: (user: User) => Promise<void>;
}

// Initialize the Event model
Event.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Event name cannot be empty',
        },
        len: {
          args: [1, 255],
          msg: 'Event name must be between 1 and 255 characters',
        },
      },
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    creatorUuid: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'uuid',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
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
    tableName: 'Events',
    timestamps: true,
    indexes: [
      {
        fields: ['creatorUuid'],
      },
      {
        fields: ['date'],
      },
    ],
  }
);

// Define associations
Event.belongsTo(User, {
  foreignKey: 'creatorUuid',
  as: 'creator',
});

export default Event;
