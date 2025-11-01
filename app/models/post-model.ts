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
  tags: string[]; // Array of user UUIDs (max 10)
  event?: EventInfo; // Optional event information
  timestamp: Date; // When the post was created
  createdAt?: Date;
  updatedAt?: Date;
}

// Optional attributes for creation
type PostCreationAttributes = Optional<PostAttributes, 'uuid' | 'event' | 'timestamp' | 'createdAt' | 'updatedAt'>;

// Post model class - DO NOT declare public fields, they shadow Sequelize getters/setters
export class Post extends Model<PostAttributes, PostCreationAttributes> implements PostAttributes {
  declare uuid: string;
  declare authorUuid: string;
  declare poze: string[];
  declare text: string;
  declare tags: string[];
  declare event?: EventInfo;
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
    tags: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      validate: {
        isValidTags(value: string[]) {
          if (!Array.isArray(value)) {
            throw new Error('Tags must be an array');
          }
          if (value.length > 10) {
            throw new Error('Maximum 10 users can be tagged');
          }
          // Validate each UUID
          value.forEach(uuid => {
            if (typeof uuid !== 'string' || !uuid.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
              throw new Error('Each tag must be a valid UUID');
            }
          });
        },
      },
    },
    event: {
      type: DataTypes.JSON,
      allowNull: true,
      validate: {
        isValidEvent(value: EventInfo | null) {
          if (value !== null && value !== undefined) {
            if (typeof value !== 'object' || !value.location || !value.time) {
              throw new Error('Event must have location and time properties');
            }
            if (typeof value.location !== 'string' || value.location.trim() === '') {
              throw new Error('Event location must be a non-empty string');
            }
            // Check if time is a valid date
            const timeValue = value.time;
            if (!(timeValue instanceof Date)) {
              const parsedDate = new Date(timeValue);
              if (isNaN(parsedDate.getTime())) {
                throw new Error('Event time must be a valid date');
              }
            }
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

export default Post;
