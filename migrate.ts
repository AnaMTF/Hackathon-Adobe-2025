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
        defaultValue: 'online', // Changed default to 'online'
      });
      console.log('✓ status column added');
    } else {
      console.log('✓ status column already exists');
      // Update the default value for the status column
      console.log('Updating default value for status column...');
      await sequelize.query(`
        UPDATE users SET status = 'online' WHERE status = 'offline' AND lastSeen IS NULL
      `);
      console.log('✓ Updated existing users without lastSeen to online');
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
