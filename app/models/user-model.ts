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
  createdAt?: Date;
  updatedAt?: Date;
}

// Optional attributes for creation (uuid will be auto-generated)
type UserCreationAttributes = Optional<UserAttributes, 'uuid' | 'poza' | 'telefon' | 'location' | 'createdAt' | 'updatedAt'>;

// User model class
export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public uuid!: string;
  public numeFullName!: string;
  public email!: string;
  public parola!: string;
  public poza?: string;
  public telefon?: string;
  public departament!: string;
  public jobTitle!: string;
  public location?: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
  }
);

export default User;
