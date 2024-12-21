// import { connectToMongoDB } from './connect-mongo.mjs';
import fs from 'fs/promises';
import path from 'path';

// Reads JSON data
const readJSONFile = async (fileName) => {
  try {
    const filePath = path.join('database', 'json-data', fileName);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading file ${fileName}:`, error);
    throw error;
  }
};

// Writes JSON data
const writeJSONFile = async (fileName, data) => {
  try {
    const filePath = path.join('database', 'json-data', fileName);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing file ${fileName}:`, error);
    throw error;
  }
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Fetch all  /////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Fetches data from MongoDB or falls back to JSON
const fetchData = async (collectionName, jsonFileName) => {
  try {
    const { [collectionName + 'Collection']: collection, client } = await connectToMongoDB(collectionName);
    const documents = await collection.find({}).toArray();
    await client.close();
    return documents;
  } catch (error) {
    console.error(`Error fetching from MongoDB, falling back to JSON (${collectionName}):`, error);
    return await readJSONFile(jsonFileName);
  }
};

export const fetchChats = async () => await fetchData('chats', 'chats.json');
export const fetchNotifications = async () => await fetchData('logs', 'notifications.json');
export const fetchMessages = async () => await fetchData('messages', 'messages.json');


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Create Chat  ///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Creates a chat document and logs activity
export const createChat = async (chat_user_1, chat_user_2) => {
  const chatId = `chat-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const newChat = { id: chatId, chat_user_1, chat_user_2, created_at: new Date() };

  const logEntry = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    event_type: 'chats',
    user_id: chat_user_1,
    related_user: chat_user_2,
    message1: 'Du har startet en chat med',
    message2: 'har startet en chat med dig',
    created_at: new Date(),
  };

  try {
    const { chatCollection, logsCollection, client } = await connectToMongoDB('chats');
    await chatCollection.insertOne(newChat);
    await logsCollection.insertOne(logEntry);
    await client.close();
    return { newChat, logEntry };
  } catch (error) {
    console.error('Error creating chat in MongoDB, falling back to JSON:', error);
    const chats = await readJSONFile('chats.json');
    const logs = await readJSONFile('notifications.json');
    chats.push(newChat);
    logs.push(logEntry);
    await writeJSONFile('chats.json', chats);
    await writeJSONFile('notifications.json', logs);
    return { newChat, logEntry };
  }
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Create Message  ///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Function to create a new message and log the activity
export async function createMessage(chat_id, sender_id, message) {
  try {
    const { messagesCollection, logsCollection, client } = await connectToMongoDB('messages');

    // Generate a unique id for the message
    const messageId = `message-${new Date().getTime()}-${Math.floor(Math.random() * 1000)}`;

    // Create the new message document
    const newMessage = {
      id: messageId,
      chat_id: chat_id, // Chat ID associated with the message
      sender_id: sender_id, // Sender ID (user_id from sessionData)
      message: message, // Message text from the input field
      sent_at: new Date(), // Timestamp for when the message is sent
    };

    console.log('New message data:', newMessage);

    // Insert the new message document into the messages collection
    const messageResult = await messagesCollection.insertOne(newMessage);
    console.log('Message Insert Result:', messageResult);

    // Log the message creation as a notification (optional)
    const newMessageNotification = {
      id: `log-${new Date().getTime()}-${Math.floor(Math.random() * 1000)}`,
      event_type: `message`,
      user_id: sender_id, // The sender's user ID
      related_user: chat_id, // The chat ID (or related user, depending on your logic)
      message: `User ${sender_id} sent a message in chat ${chat_id}: "${message}"`,
      created_at: new Date(),
    };

    console.log('New message notification data:', newMessageNotification);

    // Insert the notification into the logs collection
    const logResult = await logsCollection.insertOne(newMessageNotification);
    console.log('Log Insert Result:', logResult);

    // Close the client connection after operations
    await client.close();

    return { messageResult, logResult };
  } catch (error) {
    console.error('Error creating message:', error);
  }
}
