import express from 'express';
import { connectToPGDatabase } from '../database/postgres/connect-postgres.mjs';
import { connectToMongoDB } from '../database/mongo/connect-mongo.mjs';
import userRoutes from './index.mjs';

const app = express();

// Connect to the PostgreSQL database
connectToPGDatabase();

// Connect to the Mongo database
connectToMongoDB();

// Use the user routes
app.use(userRoutes);

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
