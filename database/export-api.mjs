import fs from 'fs';
import { connectToMongoDB } from './mongo/connect-mongo.mjs';
import { connectToPGDatabase, queryDatabase, closeDatabaseConnection } from './postgres/connect-postgres.mjs';

async function exportData() {
  try {
    // Fetch data from MongoDB
    const { chatCollection, logsCollection, messagesCollection, client: mongoClient } = await connectToMongoDB();
    const chats = await chatCollection.find().toArray();
    const logs = await logsCollection.find().toArray();
    const messages = await messagesCollection.find().toArray();

    // Write MongoDB data to JSON files
    fs.writeFileSync('./data/chats.json', JSON.stringify(chats, null, 2));
    fs.writeFileSync('./data/logs.json', JSON.stringify(logs, null, 2));
    fs.writeFileSync('./data/messages.json', JSON.stringify(messages, null, 2));

    console.log('MongoDB data exported successfully.');
    mongoClient.close();

    // Fetch data from PostgreSQL
    await connectToPGDatabase();
    const users = await queryDatabase('SELECT * FROM users');
    const orders = await queryDatabase('SELECT * FROM orders');

    // Write PostgreSQL data to JSON files
    fs.writeFileSync('./data/users.json', JSON.stringify(users, null, 2));
    fs.writeFileSync('./data/orders.json', JSON.stringify(orders, null, 2));

    console.log('PostgreSQL data exported successfully.');
    await closeDatabaseConnection();
  } catch (error) {
    console.error('Error exporting data:', error);
  }
}

exportData();
