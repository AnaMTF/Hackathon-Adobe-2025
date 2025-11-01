import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../lib/database';

export interface RewardAttributes {
  id: string;
  slug?: string;
  title: string;
  description?: string;
  price: number; // points
  stock?: number;
  img?: string | null; // URL or data URL
  createdAt?: Date;
  updatedAt?: Date;
}

type RewardCreationAttributes = Optional<RewardAttributes, 'id' | 'description' | 'img' | 'stock' | 'createdAt' | 'updatedAt'>;

export class Reward extends Model<RewardAttributes, RewardCreationAttributes> implements RewardAttributes {
  declare id: string;
  declare slug?: string;
  declare title: string;
  declare description?: string;
  declare price: number;
  declare stock?: number;
  declare img?: string | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Reward.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 0 },
    },
    img: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
      validate: { min: 0 },
    },
  },
  {
    sequelize,
    modelName: 'Reward',
    tableName: 'rewards',
    timestamps: true,
  }
);

export default Reward;
