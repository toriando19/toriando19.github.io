import fs from 'fs';
import path from 'path';
import { queryDatabase } from './connect-postgres.mjs';

// Utility function to read JSON files
const readJSONFile = (fileName) => {
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

// Fetch all users
export const fetchAllUsers = async () => {
  try {
    const users = await queryDatabase('SELECT * FROM users');
    return users;
  } catch (err) {
    console.error('Error fetching users from PostgreSQL, falling back to JSON:', err);
    return await readJSONFile('users.json');
  }
};

// Fetch all interests
export const fetchAllInterests = async () => {
  try {
    const interests = await queryDatabase('SELECT * FROM interests');
    return interests;
  } catch (err) {
    console.error('Error fetching interests from PostgreSQL, falling back to JSON:', err);
    return await readJSONFile('interests.json');
  }
};

// Fetch all user-interest records
export const fetchAllUserInterest = async () => {
  try {
    const userInterests = await queryDatabase('SELECT * FROM user_interest');
    return userInterests;
  } catch (err) {
    console.error('Error fetching user interests from PostgreSQL, falling back to JSON:', err);
    return await readJSONFile('user_interest.json');
  }
};

// Fetch all matches
export const fetchAllMatches = async () => {
  try {
    const matches = await queryDatabase('SELECT * FROM matches');
    return matches;
  } catch (err) {
    console.error('Error fetching matches from PostgreSQL:', err);
    throw new Error("Error fetching matches from Postgres");
  }
};

// Function to add user interest
export const addUserInterest = async (user_interest_user, user_interest_interest) => {
  try {
    const result = await queryDatabase(
      'INSERT INTO user_interest (user_interest_user, user_interest_interest) VALUES ($1, $2) RETURNING user_interest_user, user_interest_interest',
      [user_interest_user, user_interest_interest]
    );

    // Log the inserted user_interest_user and user_interest_interest
    if (result.length > 0) {
      console.log('Interest added successfully: User:', result[0].user_interest_user,', Interest', result[0].user_interest_interest);
    } else {
      console.log('No interest added');
    }
  } catch (error) {
    console.error('Error adding interest to PostgreSQL:', error);
  }
};

// Function to remove user interest
export const removeUserInterest = async (user_interest_user, user_interest_interest) => {
  try {
    const result = await queryDatabase(
      'DELETE FROM user_interest WHERE user_interest_user = $1 AND user_interest_interest = $2 RETURNING user_interest_user, user_interest_interest',
      [user_interest_user, user_interest_interest]
    );

    // Log the deleted user_interest_user and user_interest_interest
    if (result.length > 0) {
      console.log('Interest removed successfully: User:', result[0].user_interest_user,', Interest', result[0].user_interest_interest);
    } else {
      console.log('No interest removed');
    }
  } catch (error) {
    console.error('Error removing interest from PostgreSQL:', error);
  }
};
