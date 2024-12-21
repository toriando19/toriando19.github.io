import fs from 'fs';
import path from 'path';

// Utility function to read JSON files
const readMongoJSONFile = (fileName) => {
  const filePath = path.join('database', 'json-data', fileName);
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(data));
      }
    });
  });
};

// Utility function to write to JSON files
const writeMongoJSONFile = (fileName, data) => {
  const filePath = path.join('database', 'json-data', fileName);
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Create Chat ///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Function to create a chat and log the activity
export async function createChatJSON(chat_user_1, chat_user_2) {
  try {
    const chats = await readMongoJSONFile('chats.json');
    const notifications = await readMongoJSONFile('notifications.json');

    // Generate a unique ID for the chat
    const chatId = `chat-${new Date().getTime()}-${Math.floor(Math.random() * 1000)}`;

    // Create the new chat document
    const newChat = {
      id: chatId,
      chat_user_1,
      chat_user_2,
      created_at: new Date(),
    };

    chats.push(newChat);
    await writeMongoJSONFile('chats.json', chats);

    // Log the creation as a notification
    const newChatNotification = {
      id: `log-${new Date().getTime()}-${Math.floor(Math.random() * 1000)}`,
      event_type: `chats`,
      user_id: chat_user_1,
      related_user: chat_user_2,
      message1: "Du har startet en chat med",
      message2: "har startet en chat med dig",
      created_at: new Date(),
    };

    notifications.push(newChatNotification);
    await writeMongoJSONFile('notifications.json', notifications);

    return { newChat, newChatNotification };
  } catch (error) {
    console.error('Error creating chat:', error);
    throw new Error('Failed to create chat');
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Create Message ////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Function to create a new message and log the activity
export async function createMessage(chat_id, sender_id, message) {
  try {
    const messages = await readMongoJSONFile('messages.json');
    const notifications = await readMongoJSONFile('notifications.json');

    // Generate a unique ID for the message
    const messageId = `message-${new Date().getTime()}-${Math.floor(Math.random() * 1000)}`;

    // Create the new message document
    const newMessage = {
      id: messageId,
      chat_id,
      sender_id,
      message,
      sent_at: new Date(),
    };

    messages.push(newMessage);
    await writeMongoJSONFile('messages.json', messages);

    // Log the message creation as a notification
    const newMessageNotification = {
      id: `log-${new Date().getTime()}-${Math.floor(Math.random() * 1000)}`,
      event_type: `message`,
      user_id: sender_id,
      related_user: chat_id,
      message: `User ${sender_id} sent a message in chat ${chat_id}: "${message}"`,
      created_at: new Date(),
    };

    notifications.push(newMessageNotification);
    await writeMongoJSONFile('notifications.json', notifications);

    return { newMessage, newMessageNotification };
  } catch (error) {
    console.error('Error creating message:', error);
    throw new Error('Failed to create message');
  }
}
