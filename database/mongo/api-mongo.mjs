// Import the connection to the Mongo database
import { connectToMongoDB } from './connect-mongo.mjs'; 


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Fetch all – functions  /////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Fetch documents from the 'chats' collection
export async function fetchChats() {
  try {
    const { chatCollection, client } = await connectToMongoDB('chats');
    const documents = await chatCollection.find({}).toArray();
    await client.close();
    return documents;
  } catch (error) {
    console.error('Error fetching documents:', error);
  }
}

// Fetch documents from the 'notifications' collection
export async function fetchNotifications() {
  try {
    const { logsCollection, client } = await connectToMongoDB('logs');
    const documents = await logsCollection.find({}).toArray();
    await client.close();
    return documents;
  } catch (error) {
    console.error('Error fetching notifications:', error);
  }
}

// Fetch documents from the 'messages' collection
export async function fetchMessages() {
  try {
    const { messagesCollection, client } = await connectToMongoDB('messages');
    const documents = await messagesCollection.find({}).toArray();
    await client.close();
    return documents;
  } catch (error) {
    console.error('Error fetching notifications:', error);
  }
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Create – functions  ////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Create documents in the 'chats' collection
export async function createChat(chat_user_1, chat_user_2) {
  try {
    const { chatCollection, logsCollection, client } = await connectToMongoDB('chats');
    
    // Ensure chat_user_1 and chat_user_2 are integers
    const user1 = parseInt(chat_user_1, 10);
    const user2 = parseInt(chat_user_2, 10);
    
    // Ensure user1 is always the smaller number to prevent duplicate chats like (1-2 and 2-1)
    const [userA, userB] = user1 < user2 ? [user1, user2] : [user2, user1];
    
    // Check if a chat already exists between these two users
    const existingChat = await chatCollection.findOne({
      $or: [
        { chat_user_1: userA, chat_user_2: userB },
        { chat_user_1: userB, chat_user_2: userA },
      ]
    });
    
    // If a chat already exists, don't create a new one
    if (existingChat) {
      console.log('Chat already exists between these two users');
      return { message: 'Chat already exists' };
    }

    // Generate a unique id for the chat
    const chatId = `chat-${new Date().getTime()}-${Math.floor(Math.random() * 1000)}`;
    
    // Create the new chat document
    const newChat = {
      id: chatId,
      chat_user_1: userA,
      chat_user_2: userB, 
      created_at: new Date(),
    };
    console.log('New chat data:', newChat);
    
    // Insert the new chat document into the collection
    const chatResult = await chatCollection.insertOne(newChat);
    console.log('Chat Insert Result:', chatResult);
    
    // Log the creation as a notification
    const newChatNotification = {
      id: `log-${new Date().getTime()}-${Math.floor(Math.random() * 1000)}`,
      event_type: `Chats`,
      user_id: userA,  // Use integer for user_id
      related_user: userB,  // Use integer for related_user
      message1: "Du har startet en chat med",
      message2: "har startet en chat med dig",
      created_at: new Date(),
    };
    
    console.log('New notification data:', newChatNotification);
    
    // Insert the notification into the logs collection
    const logResult = await logsCollection.insertOne(newChatNotification);
    console.log('Log Insert Result:', logResult);
    
    // Close the client connection after operations
    await client.close();

    return { chatResult, logResult };
  } catch (error) {
    console.error('Error creating chat:', error);
    throw error;  
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Function to create a new message and log the activity
export async function createMessage(req, res) {
  try {
    // Destructure data from the request body
    const { chat_id, sender_id, recipient_id, message } = req.body;

    // Check if all required fields are present
    if (!chat_id || !sender_id || !recipient_id || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Connect to MongoDB and get collections
    const { messagesCollection, logsCollection, client } = await connectToMongoDB('messages');

    // Generate a unique ID for the message
    const messageId = `message-${new Date().getTime()}-${Math.floor(Math.random() * 1000)}`;

    // Create the message document
    const newMessage = {
      id: messageId,
      chat_id: chat_id, // Chat ID associated with the message
      sender_id: sender_id, // Sender ID
      recipient_id: recipient_id, // Recipient ID
      message: message, // Message content
      sent_at: new Date(), // Timestamp of when the message is sent
    };

    console.log('New message data:', newMessage); // Log the message data for debugging

    // Insert the new message into the messages collection
    const messageResult = await messagesCollection.insertOne(newMessage);
    console.log('Message Insert Result:', messageResult);

    // Create a log entry for the message creation
    const newMessageNotification = {
      id: `log-${new Date().getTime()}-${Math.floor(Math.random() * 1000)}`,
      event_type: 'Beskeder',
      user_id: sender_id, // Sender's user ID
      related_user: recipient_id, // Chat ID
      message: `${message}`,
      created_at: new Date(),
    };

    console.log('New message notification data:', newMessageNotification);

    // Insert the log entry into the logs collection
    const logResult = await logsCollection.insertOne(newMessageNotification);
    console.log('Log Insert Result:', logResult);

    // Close the MongoDB client connection
    await client.close();

    // Return a success response with the results of both insertions
    return { messageResult, logResult };
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: 'Error creating message' });
  }
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DELETE – functions  ////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export async function deleteChat(chat_id) {
  try {
    const { chatCollection, client } = await connectToMongoDB('chats');
    const result = await chatCollection.deleteOne({ id: chat_id });
    await client.close();
    return result;
  } catch (error) {
    console.error('Error deleting chat:', error);
    throw error; 
  }
}

