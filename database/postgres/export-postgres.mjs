import fs from 'fs/promises';
import { queryDatabase, closeDatabaseConnection } from './connect-postgres.mjs';

async function exportPostgresData() {
  try {
    // Example query: replace with actual table names and queries
    const users = await queryDatabase('SELECT * FROM users');
    const posts = await queryDatabase('SELECT * FROM posts');

    // Write data to JSON files
    await fs.writeFile('./database/postgres/users.json', JSON.stringify(users, null, 2));
    await fs.writeFile('./database/postgres/posts.json', JSON.stringify(posts, null, 2));

    console.log('Postgres data exported successfully!');
    await closeDatabaseConnection();
  } catch (error) {
    console.error('Error exporting Postgres data:', error);
  }
}

exportPostgresData();
