import request from 'supertest';
import express from 'express';
import { fetchAllUserInterest, addUserInterest, removeUserInterest } from '../database/postgres/api-postgres.mjs'; // Ensure the function is correctly imported
import { queryDatabase } from '../database/postgres/connect-postgres.mjs'; // Mock the database module

jest.mock('../database/postgres/connect-postgres.mjs'); // Mock the database module

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// API Setup  /////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const app = express();
app.use(express.json());

app.get('/userinterest', async (req, res) => {
    try {
        const userInterests = await fetchAllUserInterest();
        res.status(200).json(userInterests);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post('/userinterest', async (req, res) => {
    const { user_interest_user, user_interest_interest } = req.body;
    try {
        await addUserInterest(user_interest_user, user_interest_interest);
        res.status(201).json({ message: 'Interest added successfully' });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.delete('/userinterest', async (req, res) => {
    const { user_interest_user, user_interest_interest } = req.body;
    try {
        await removeUserInterest(user_interest_user, user_interest_interest);
        res.status(200).json({ message: 'Interest removed successfully' });
    } catch (error) {
        res.status(500).send(error.message);
    }
});


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Mocking Data  //////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

describe('User Interests API', () => {
    
    // Reset all mocks between tests
    afterEach(() => {
        jest.clearAllMocks();
    });
    
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Fetch all user-interests  //////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    describe('GET /userinterest', () => {
        it('Fetches all user-interests', async () => {
            queryDatabase.mockResolvedValue([
                { user_interest_user: 1, user_interest_interest: 2 },
                { user_interest_user: 2, user_interest_interest: 3 },
            ]); 

            const response = await request(app).get('/userinterest');

            expect(response.status).toBe(200);
            expect(response.body).toEqual([
                { user_interest_user: 1, user_interest_interest: 2 },
                { user_interest_user: 2, user_interest_interest: 3 },
            ]);
            expect(queryDatabase).toHaveBeenCalledWith('SELECT * FROM user_interest');
        });
    });


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Adds new user-interest  ////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    describe('POST /userinterest', () => {
        it('Inserts a user-interest', async () => {
            queryDatabase.mockResolvedValue([
                { user_interest_user: 1, user_interest_interest: 2 },
            ]);

            const response = await request(app)
                .post('/userinterest')
                .send({ user_interest_user: 1, user_interest_interest: 2 });

            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Interest added successfully');
            expect(queryDatabase).toHaveBeenCalledWith(
                'INSERT INTO user_interest (user_interest_user, user_interest_interest) VALUES ($1, $2) RETURNING user_interest_user, user_interest_interest',
                [1, 2]
            );
        });
    });


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Removes a user-interest  ///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    describe('DELETE /userinterest', () => {
        it('Deletes a user-interest', async () => {
            queryDatabase.mockResolvedValue([
                { user_interest_user: 1, user_interest_interest: 2 },
            ]);

            const response = await request(app)
                .delete('/userinterest')
                .send({ user_interest_user: 1, user_interest_interest: 2 });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Interest removed successfully');
            expect(queryDatabase).toHaveBeenCalledWith(
                'DELETE FROM user_interest WHERE user_interest_user = $1 AND user_interest_interest = $2 RETURNING user_interest_user, user_interest_interest',
                [1, 2]
            );
        });
    });
});
