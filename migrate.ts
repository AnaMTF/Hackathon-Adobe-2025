// Database migration script to add status and lastSeen columns to users table
import { sequelize } from './lib/database';
import { QueryInterface, DataTypes } from 'sequelize';

async function migrate() {
  console.log('Starting database migration...');
  
  const queryInterface: QueryInterface = sequelize.getQueryInterface();
  
  try {
    // Check if status column exists
    const tableDescription = await queryInterface.describeTable('users');
    
    if (!tableDescription.status) {
      console.log('Adding status column to users table...');
      await queryInterface.addColumn('users', 'status', {
        type: DataTypes.ENUM('online', 'away', 'busy', 'offline'),
        allowNull: false,
        defaultValue: 'offline',
      });
      console.log('✓ status column added');
    } else {
      console.log('✓ status column already exists');
    }
    
    if (!tableDescription.lastSeen) {
      console.log('Adding lastSeen column to users table...');
      await queryInterface.addColumn('users', 'lastSeen', {
        type: DataTypes.DATE,
        allowNull: true,
      });
      console.log('✓ lastSeen column added');
    } else {
      console.log('✓ lastSeen column already exists');
    }
    
    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
