import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../lib/database';

// User attributes interface
export interface UserAttributes {
  uuid: string;
  numeFullName: string;
  email: string;
  parola: string;
  poza?: string; // optional - URL to profile picture
  telefon?: string; // optional
  departament: string;
  jobTitle: string;
  location?: string; // optional
  status?: 'online' | 'away' | 'busy' | 'offline'; // user's availability status
  lastSeen?: Date; // last activity timestamp
  createdAt?: Date;
  updatedAt?: Date;
}

// Optional attributes for creation (uuid will be auto-generated)
type UserCreationAttributes = Optional<UserAttributes, 'uuid' | 'poza' | 'telefon' | 'location' | 'status' | 'lastSeen' | 'createdAt' | 'updatedAt'>;

// User model class - DO NOT declare public fields, they shadow Sequelize getters/setters
export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare uuid: string;
  declare numeFullName: string;
  declare email: string;
  declare parola: string;
  declare poza?: string;
  declare telefon?: string;
  declare departament: string;
  declare jobTitle: string;
  declare location?: string;
  declare status?: 'online' | 'away' | 'busy' | 'offline';
  declare lastSeen?: Date;

  // Timestamps
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

// Initialize the User model
User.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    numeFullName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100],
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    parola: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [6, 255], // Minimum 6 characters for password
      },
    },
    poza: {
      type: DataTypes.TEXT, // Changed to TEXT to store base64 images
      allowNull: true,
      // Removed URL validation since we're storing base64 data
    },
    telefon: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: /^[+]?[\d\s-().]+$/, // Basic phone number validation
      },
    },
    departament: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100],
      },
    },
    jobTitle: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100],
      },
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [1, 255],
      },
    },
    status: {
      type: DataTypes.ENUM('online', 'away', 'busy', 'offline'),
      allowNull: false,
      defaultValue: 'online',
    },
    lastSeen: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
  }
);

export default User;
