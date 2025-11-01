import { sequelize } from './lib/database';

async function migrateUserPoints() {
  console.log('Starting user points migration...');

  try {
    // Add points column to users table if it doesn't exist
    await sequelize.query(`
      ALTER TABLE users ADD COLUMN points INTEGER DEFAULT 1000 NOT NULL;
    `).catch((err) => {
      // If column already exists, ignore the error
      if (err.message.includes('duplicate column name')) {
        console.log('✓ Points column already exists');
        return;
      }
      throw err;
    });

    console.log('✓ Points column added successfully');

    // Update any existing users who might have NULL points to 1000
    const [, affectedCount] = await sequelize.query(`
      UPDATE users SET points = 1000 WHERE points IS NULL;
    `);

    console.log(`✓ Updated ${affectedCount} users with default points`);

    console.log('✅ User points migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateUserPoints();
