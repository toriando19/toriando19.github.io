import fs from 'fs';
import { connectToMongoDB } from './connect-mongo.mjs';

async function exportMongoData() {
  try {
    const { chatCollection, logsCollection, messagesCollection, client } = await connectToMongoDB();

    // Fetch data from collections
    const chats = await chatCollection.find().toArray();
    const logs = await logsCollection.find().toArray();
    const messages = await messagesCollection.find().toArray();

    // Write data to JSON files
    fs.writeFileSync('./data/chats.json', JSON.stringify(chats, null, 2));
    fs.writeFileSync('./data/logs.json', JSON.stringify(logs, null, 2));
    fs.writeFileSync('./data/messages.json', JSON.stringify(messages, null, 2));

    console.log('MongoDB data exported successfully.');
    client.close();
  } catch (error) {
    console.error('Error exporting MongoDB data:', error);
  }
}

exportMongoData();
