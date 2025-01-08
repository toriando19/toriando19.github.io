import request from 'supertest';
import express from 'express';
import { fetchAllUsers, loginUser } from '../database/postgres/api-postgres.mjs'; // Ensure the function is correctly imported
import { queryDatabase } from '../database/postgres/connect-postgres.mjs'; // Mock the database module

jest.mock('../database/postgres/connect-postgres.mjs'); // Mock the database module


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// API Setup  /////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const app = express();
app.use(express.json());

app.get('/users', async (req, res) => {
  try {
    const users = await fetchAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

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


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Fetch all users  ///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

describe('GET /users', () => {

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Mocking Data  //////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // Mock the database query response
  beforeEach(() => {
    queryDatabase.mockResolvedValue([
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' },
    ]);
  });

  // Reset all mocks between tests
  afterEach(() => {
    jest.clearAllMocks(); 
  });


  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Test Scenarios  ////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // Fetch all users
  it('Fetches all users', async () => {
    const response = await request(app).get('/users');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' },
    ]);
    expect(queryDatabase).toHaveBeenCalledWith('SELECT * FROM users');
  });
});


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Login user  ////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

describe('POST /login', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Reset all mocks between tests
  });

  it('Login successfully', async () => {
    queryDatabase.mockResolvedValueOnce([
      { user_id: 1, user_username: 'johndoe', user_name: 'John Doe', user_email: 'john@example.com' },
    ]); // Mock user data
    queryDatabase.mockResolvedValueOnce([{ interest: 'coding' }]); // Mock user interests

    const response = await request(app)
      .post('/login')
      .send({ email: 'john@example.com', password: 'password123' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      user_id: 1,
      username: 'johndoe',
      user_name: 'John Doe',
      user_email: 'john@example.com',
      user_interest: [{ interest: 'coding' }],
    });
    expect(queryDatabase).toHaveBeenCalledTimes(2);
  });
});





