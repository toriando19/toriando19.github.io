import pkg from 'pg';
const { Client } = pkg;

// PostgreSQL connection configuration
const postgresDB = new Client({
  user: 'postgres', 
  host: 'localhost',
  database: 'bachelor',
  password: 'postgresAdmin4',
  port: 5432,
});

// Function to connect to the database
export const connectToPGDatabase = async () => {
  try {
    await postgresDB.connect(); 
    console.log("Connected successfully to Postgres");
  } catch (err) {
    console.error("Database connection failed:", err.stack);
  }
};

// Function to execute a query with parameters
export const queryDatabase = async (query, params = []) => {
  try {
    const result = await postgresDB.query(query, params); // Pass parameters here
    return result.rows;
  } catch (err) {
    console.error("Query execution failed:", err.stack);
    throw new Error("Query execution failed");  
  }
};

// Function to close the database connection
export const closeDatabaseConnection = async () => {
  try {
    await postgresDB.end(); 
    console.log("Database connection closed.");
  } catch (err) {
    console.error("Failed to close the database connection:", err.stack);
  }
};
