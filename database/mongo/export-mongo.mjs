import fs from 'fs/promises';
import { connectToMongoDB } from './connect-mongo.mjs';

async function exportMongoData() {
  try {
    const { chatCollection, logsCollection, messagesCollection, client } = await connectToMongoDB();

    // Fetch data from each collection
    const chats = await chatCollection.find({}).toArray(); 
    const logs = await logsCollection.find({}).toArray();
    const messages = await messagesCollection.find({}).toArray();

    // Write data to JSON files
    await fs.writeFile('./database/mongo/chats.json', JSON.stringify(chats, null, 2));
    await fs.writeFile('./database/mongo/logs.json', JSON.stringify(logs, null, 2));
    await fs.writeFile('./database/mongo/messages.json', JSON.stringify(messages, null, 2));

    console.log('MongoDB data exported successfully!');
    await client.close();
  } catch (error) {
    console.error('Error exporting MongoDB data:', error);
  }
}

exportMongoData();
