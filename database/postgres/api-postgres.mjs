// Import the connection and query executer to the Postgres database
import { queryDatabase } from './connect-postgres.mjs';

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Login API  /////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const loginUser = async (email, password) => {
  try {

    // Fetch the user matching the provided email and password
    const users = await queryDatabase(
      'SELECT * FROM users WHERE user_email = $1 AND user_password = $2',
      [email, password]
    );
    
    // Verify the user
    if (users.length === 0) {
      throw new Error('Invalid credentials.');
    }

    // Fetch the first user
    const user = users[0];

    // Fetch the user's interests
    const userInterests = await queryDatabase(
      'SELECT * FROM user_interest WHERE user_interest_user = $1',
      [user.user_id]
    );

    // Fetch important user-informations 
    return {
      user_id: user.user_id,
      username: user.user_username,
      user_name: user.user_name,
      user_email: user.user_email,
      user_interest: userInterests,
    };
  } catch (err) {
    throw new Error('Error during login: ' + err.message);
  }
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Fetch all – functions  /////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// Fetch all users
export const fetchAllUsers = async () => {
  try {
    const users = await queryDatabase('SELECT * FROM users');
    return users;
  } catch (err) {
    throw new Error("Error fetching users: " + err.message);
  }
};

// Fetch all interests
export const fetchAllInterests = async () => {
  try {
    const interests = await queryDatabase('SELECT * FROM interests');
    return interests;
  } catch (err) {
    throw new Error("Error fetching interests: " + err.message);
  }
};

// Fetch all user-interest
export const fetchAllUserInterest = async () => {
  try {
    const userInterests = await queryDatabase('SELECT * FROM user_interest');
    return userInterests;
  } catch (err) {
    throw new Error("Error fetching user interests: " + err.message);
  }
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Fetch specific – functions  ////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Fetch matching user-interests
export const fetchMatchingUserInterest = async (sessionUserId, relatedUserId) => {
  try {

    // Query to get common interests between the session user and the related user
    const query = `
      SELECT * FROM user_interest
      WHERE user_interest_user IN ($1, $2) 
      AND user_interest_interest IN (
      SELECT user_interest_interest 
      FROM user_interest 
      WHERE user_interest_user = $1
      )
    `;
    const userInterests = await queryDatabase(query, [sessionUserId, relatedUserId]);

    return userInterests;
  } catch (err) {
    throw new Error("Error fetching matching user interests: " + err.message);
  }
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Create – functions  ////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Function to add user interest
export const addUserInterest = async (user_interest_user, user_interest_interest) => {
  try {
    const result = await queryDatabase(`
      INSERT INTO user_interest (user_interest_user, user_interest_interest) 
      VALUES ($1, $2) 
      RETURNING user_interest_user, user_interest_interest
      `,
      [user_interest_user, user_interest_interest]
    );

    // Log the inserted user_interest_user and user_interest_interest
    if (result.length > 0) {
      console.log('Interest added successfully: User:', result[0].user_interest_user,', Interest', result[0].user_interest_interest);
    } else {
      console.log('No interest added');
    }
  } catch (error) {
    console.error('Error adding interest:', error);
  }
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Delete – functions  ////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Function to remove user interest
export const removeUserInterest = async (user_interest_user, user_interest_interest) => {
  try {
    const result = await queryDatabase(`
      DELETE FROM user_interest 
      WHERE user_interest_user = $1 
      AND user_interest_interest = $2 
      RETURNING user_interest_user, user_interest_interest
      `,
      [user_interest_user, user_interest_interest]
    );


    if (result.length > 0) {
      console.log('Interest removed successfully: User:', result[0].user_interest_user,', Interest', result[0].user_interest_interest);
    } else {
      console.log('No interest removed');
    }
  } catch (error) {
    console.error('Error removing interest:', error);
  }
};

