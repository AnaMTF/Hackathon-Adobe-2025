// Database migration script to update posts table structure
import { sequelize } from './lib/database';

async function migrate() {
  console.log('Starting posts table migration...');
  
  try {
    // Check if migration has already been done
    const [tables]: any = await sequelize.query(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='posts_new';
    `);
    
    if (tables.length > 0) {
      console.log('Migration already in progress or completed. Skipping...');
      process.exit(0);
    }

    // Create new posts table with correct structure
    console.log('Creating new posts table structure...');
    await sequelize.query(`
      CREATE TABLE posts_new (
        uuid UUID PRIMARY KEY,
        authorUuid UUID NOT NULL,
        title VARCHAR(120) NOT NULL,
        body TEXT NOT NULL,
        image TEXT,
        code TEXT,
        timestamp DATETIME NOT NULL,
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL,
        FOREIGN KEY (authorUuid) REFERENCES users(uuid)
      );
    `);
    console.log('✓ New table structure created');
    
    // Migrate data from old table to new table
    console.log('Migrating existing post data...');
    await sequelize.query(`
      INSERT INTO posts_new (uuid, authorUuid, title, body, image, code, timestamp, createdAt, updatedAt)
      SELECT 
        uuid,
        authorUuid,
        COALESCE(
          CASE 
            WHEN instr(text, char(10) || char(10)) > 0 
            THEN substr(text, 1, min(instr(text, char(10) || char(10)) - 1, 120))
            ELSE substr(text, 1, 120)
          END,
          'Untitled Post'
        ) as title,
        COALESCE(
          CASE 
            WHEN instr(text, char(10) || char(10)) > 0 
            THEN substr(text, instr(text, char(10) || char(10)) + 2)
            ELSE text
          END,
          text
        ) as body,
        json_extract(poze, '$[0]') as image,
        NULL as code,
        timestamp,
        createdAt,
        updatedAt
      FROM posts;
    `);
    
    const [count]: any = await sequelize.query('SELECT COUNT(*) as count FROM posts_new');
    console.log(`✓ Migrated ${count[0].count} posts`);
    
    // Drop old table and rename new table
    console.log('Replacing old table with new table...');
    await sequelize.query('DROP TABLE posts;');
    await sequelize.query('ALTER TABLE posts_new RENAME TO posts;');
    console.log('✓ Table replaced');
    
    console.log('\n✅ Posts migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    // Clean up if migration fails
    try {
      await sequelize.query('DROP TABLE IF EXISTS posts_new;');
    } catch (e) {
      // Ignore cleanup errors
    }
    process.exit(1);
  }
}

migrate();
