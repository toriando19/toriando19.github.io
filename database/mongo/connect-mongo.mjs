import { MongoClient } from 'mongodb';

// MongoDB connection URI
const uri = 'mongodb://localhost:27017'; // MongoDB URI for local connection

// Database name
const dbName = 'bachelor'; // Database name

// Async function to connect to MongoDB and return the database and collections
export async function connectToMongoDB() {
  let client;

  try {
    // Create a new MongoClient instance
    client = new MongoClient(uri);

    // Connect to the MongoDB server
    await client.connect();

    console.log('Connected successfully to MongoDB');

    // Get the database object
    const db = client.db(dbName);

    // Get the collection objects
    const chatCollection = db.collection('chats');
    const logsCollection = db.collection('logs');
    const messagesCollection = db.collection('messages');

    // Return the database, collections, and client
    return { db, chatCollection, logsCollection, messagesCollection, client };

  } catch (error) {
    console.error('Error connecting to MongoDB', error);
    throw error; // Rethrow the error to handle it in other modules
  }
}
