import fs from 'fs';
import path from 'path';

// Utility function to read JSON files
const readPostgresJSONFile = (fileName) => {
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
const writePostgresJSONFile = (fileName, data) => {
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

// Add user interest to JSON file
export const addUserInterestJSON = async (user_interest_user, user_interest_interest) => {
  try {
    const userInterests = await readPostgresJSONFile('userinterest.json');
    userInterests.push({ user_interest_user, user_interest_interest });
    await writePostgresJSONFile('userinterest.json', userInterests);
    console.log('Interest added to JSON file');
  } catch (error) {
    console.error('Error adding interest to JSON file:', error);
    throw new Error('Failed to add interest to JSON');
  }
};

// Remove user interest from JSON file
export const removeUserInterestJSON = async (user_interest_user, user_interest_interest) => {
  try {
    const userInterests = await readPostgresJSONFile('userinterest.json');
    const updatedUserInterests = userInterests.filter(
      (interest) => interest.user_interest_user !== user_interest_user || interest.user_interest_interest !== user_interest_interest
    );
    await writePostgresJSONFile('userinterest.json', updatedUserInterests);
    console.log('Interest removed from JSON file');
  } catch (error) {
    console.error('Error removing interest from JSON file:', error);
    throw new Error('Failed to remove interest from JSON');
  }
};
