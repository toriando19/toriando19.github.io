import request from 'supertest';
import express from 'express';
import { fetchChats, createChat } from '../database/mongo/api-mongo.mjs'; // Adjust the path as needed
import { connectToMongoDB } from '../database/mongo/connect-mongo.mjs'; // Adjust the path as needed

// Mock the MongoDB connection and the database functions
jest.mock('../database/mongo/connect-mongo.mjs'); // Mock the MongoDB connection module
jest.mock('../database/mongo/api-mongo.mjs', () => ({
  ...jest.requireActual('../database/mongo/api-mongo.mjs'),
  fetchChats: jest.fn(), // Mock the fetchChats function
  createChat: jest.fn(), // Mock the createChat function
}));

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// API Setup  /////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const app = express();
app.use(express.json());

// Get all chats
app.get('/chats', async (req, res) => {
  try {
    const data = await fetchChats(); // Calls the mocked fetchChats
    res.status(200).json(data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Create a new chat (modified to POST)
app.post('/new-chat', async (req, res) => {
  const { chat_user_1, chat_user_2 } = req.body; // Changed to use POST body instead of query params

  // Validate the request body parameters
  if (!chat_user_1 || !chat_user_2) {
    return res.status(400).json({ error: 'Both chat_user_1 and chat_user_2 are required' });
  }

  try {
    // Call the mocked createChat function
    const data = await createChat(chat_user_1, chat_user_2);

    // Return the result as a JSON response
    res.status(201).json(data); // Status 201 for resource creation
  } catch (error) {
    console.error('Error in creating new chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Mocking Data  //////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

describe('Chat API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Fetches all chats  /////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  describe('GET /chats', () => {
    it('Fetch all chats', async () => {
      // Mock data to be returned by the `fetchChats` function
      const mockChats = [
        { id: 'chat-1', chat_user_1: 'user1', chat_user_2: 'user2', created_at: new Date().toISOString() },
        { id: 'chat-2', chat_user_1: 'user3', chat_user_2: 'user4', created_at: new Date().toISOString() },
      ];

      // Mock the fetchChats function to return mock data
      fetchChats.mockResolvedValue(mockChats);

      // Send a request to the /chats endpoint
      const response = await request(app).get('/chats');

      // Assertions
      expect(response.status).toBe(200); // Ensure the response status is 200
      expect(response.body).toEqual(mockChats); // Ensure the response matches the mock data
    });
  });

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Creates new chat  //////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  describe('POST /new-chat', () => {
    it('Creates a new chat', async () => {
      // Mock data for the new chat creation
      const mockChatResult = {
        chatResult: { insertedCount: 1 },
        logResult: { insertedCount: 1 },
      };

      // Mock the createChat function to return mock data
      createChat.mockResolvedValue(mockChatResult);

      // Send a request to the /new-chat endpoint with POST and body parameters
      const response = await request(app)
        .post('/new-chat')
        .send({ chat_user_1: 'user1', chat_user_2: 'user2' });

      // Assertions
      expect(response.status).toBe(201); // Ensure the response status is 201 for successful creation
      expect(response.body).toEqual(mockChatResult); // Ensure the response matches the mock result
    });
  });
});
