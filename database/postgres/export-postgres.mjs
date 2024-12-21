import fs from 'fs';
import { connectToPGDatabase, queryDatabase, closeDatabaseConnection } from './connect-postgres.mjs';

async function exportPostgresData() {
  try {
    await connectToPGDatabase();

    // Fetch data from tables
    const users = await queryDatabase('SELECT * FROM users');
    const orders = await queryDatabase('SELECT * FROM orders');

    // Write data to JSON files
    fs.writeFileSync('./data/users.json', JSON.stringify(users, null, 2));
    fs.writeFileSync('./data/orders.json', JSON.stringify(orders, null, 2));

    console.log('Postgres data exported successfully.');
    await closeDatabaseConnection();
  } catch (error) {
    console.error('Error exporting Postgres data:', error);
  }
}

exportPostgresData();
