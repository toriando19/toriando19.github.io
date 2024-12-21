import fs from 'fs';
import fetch from 'node-fetch';

const endpoints = [
  { url: 'http://localhost:3000/users', filename: 'users.json' },
  { url: 'http://localhost:3000/interests', filename: 'interests.json' },
  { url: 'http://localhost:3000/userinterest', filename: 'userinterest.json' },
  { url: 'http://localhost:3000/chats', filename: 'chats.json' },
  { url: 'http://localhost:3000/messages', filename: 'messages.json' },
  { url: 'http://localhost:3000/notifications', filename: 'notifications.json' }
];

async function fetchDataAndExport() {
  try {
    for (const endpoint of endpoints) {
      const response = await fetch(endpoint.url);
      if (!response.ok) {
        throw new Error(`Failed to fetch data from ${endpoint.url}`);
      }
      const data = await response.json();
      
      // Save data to JSON file
      fs.writeFileSync(`./data/${endpoint.filename}`, JSON.stringify(data, null, 2));
      console.log(`Data from ${endpoint.url} exported to ./data/${endpoint.filename}`);
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

fetchDataAndExport();
