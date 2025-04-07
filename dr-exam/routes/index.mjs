///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Import  ////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Import relevant modules for the application
import path from 'path';
import express from 'express';

// Import API-functions for Mongo and Postgres
import { loginUser, fetchAllUsers, fetchAllInterests, fetchAllUserInterest, fetchMatchingUserInterest, addUserInterest, removeUserInterest } from '../database/postgres/api-postgres.mjs';
import { fetchChats, createChat, deleteChat, fetchNotifications, fetchMessages, createMessage } from '../database/mongo/api-mongo.mjs';


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SPA setup //////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Use Express' route-handler
const router = express.Router();

// Serve static files from the "views" folder 
router.use(express.static(path.join(path.resolve(), 'views')));

// Serve index.html as the root
router.get('/', (req, res) => {
  res.sendFile(path.resolve('views/index.html')); 
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Postgres 'API' Routes  /////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body; 

  // Error-handler: Undefined user
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' }); 
  }

  try {
    const data = await loginUser(email, password); 
    res.status(200).json(data); 
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});


// All users
router.get('/users', async (req, res) => {
  const data = await fetchAllUsers();
  res.json(data);
});

// All interests
router.get('/interests', async (req, res) => {
  const data = await fetchAllInterests();
  res.json(data);
});

// All user-interests
router.get('/userinterest', async (req, res) => {
  const data = await fetchAllUserInterest();
  res.json(data);
});

// Specific user-interest
router.get('/matchinginterests', async (req, res) => {
  const data = await fetchMatchingUserInterest();
  res.json(data);
});


// Add user-interest
router.get('/add-userinterest', async (req, res) => {
  try {
    const {user_interest_user, user_interest_interest} = req.query;
    if (!user_interest_user || !user_interest_interest) {
      return res.status(400).json({ error: 'Missing required parameters: user_interest_user or user_interest_interest' });
    }

    const result = await addUserInterest(user_interest_user, user_interest_interest);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Error adding interest:', error);
    res.status(500).json({ error: 'Failed to add user interest' });
  }
});


// Delete user-interest
router.get('/remove-userinterest', async (req, res) => {
  try {
    const { user_interest_user, user_interest_interest } = req.query;
    if (!user_interest_user || !user_interest_interest) {
      return res.status(400).json({ error: 'Missing required parameters: user_interest_user or user_interest_interest' });
    }

    const result = await removeUserInterest(user_interest_user, user_interest_interest);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Error removing interest:', error);
    res.status(500).json({ error: 'Failed to remove user interest' });
  }
});


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Mongo Routes  //////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// All chats
router.get('/chats', async (req, res) => {
  const data = await fetchChats();
  res.json(data);
});


// Create new chat
router.get('/new-chat', async (req, res) => {
  // Log the query parameters to ensure we're receiving them
  console.log('Received request to create a new chat:', req.query);

  const { chat_user_1, chat_user_2 } = req.query;

  // Validate the query parameters
  if (!chat_user_1 || !chat_user_2) {
    return res.status(400).json({ error: 'Both chat_user_1 and chat_user_2 are required' });
  }

  try {
    // Call the createChat function and pass the user IDs
    const data = await createChat(chat_user_1, chat_user_2);
    
    // Return the result as a JSON response
    res.json(data);
  } catch (error) {
    // console.error('Error in creating new chat:', error);
    // res.status(500).json({ error: 'Internal server error' });
  }
});


// Delete chat
router.delete('/delete-chat/:chat_id', async (req, res) => {
  const { chat_id } = req.params;  // Get the chat_id from the route parameters

  // Check if chat_id is provided
  if (!chat_id) {
    return res.status(400).json({ error: 'Chat ID is required' });
  }

  try {
    // Call the deleteChat function to delete the chat by chat_id
    const result = await deleteChat(chat_id);
    
    // Check if the delete operation was successful
    if (result.deletedCount === 1) {
      res.json({ success: true, message: `Chat with ID ${chat_id} deleted successfully` });
    } else {
      res.status(404).json({ error: `Chat with ID ${chat_id} not found` });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete chat' });
  }
});


// All notifications
router.get('/notifications', async (req, res) => {
  const data = await fetchNotifications();
  res.json(data);
});

// All messages
router.get('/messages', async (req, res) => {
  const data = await fetchMessages();
  res.json(data);
});

// Create new message
router.post('/create-message', async (req, res) => {
  try {
    const data = await createMessage(req, res);  // Pass req and res to createMessage
    res.json(data);  // Send the data back as a response
  } catch (error) {
    res.status(500).json({ error: 'Error processing the request' });
  }
});


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Export: Ready to use ///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export default router;

