// This file is used to initialize the database when the Next.js server starts
// It runs once during server startup, ensuring all tables are created

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initializeDatabase } = await import('./lib/database');
    
    console.log('Initializing database on server startup...');
    await initializeDatabase();
    console.log('Database initialization complete.');
  }
}
