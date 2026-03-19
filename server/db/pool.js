const { Pool } = require('pg');
require('dotenv').config();

// A pool maintains a set of connections to the database that 
// remain open and can be dynamically allocated each time we send a query.
// This is more efficient than opening and closing connections.
// Use PG_CONNECTION_STRING if available, otherwise use credentials.
const pool = new Pool(
  process.env.PG_CONNECTION_STRING
    ? { connectionString: process.env.PG_CONNECTION_STRING }
    : {
      host: process.env.PG_HOST,
      port: process.env.PG_PORT,
      user: process.env.PG_USER,
      password: process.env.PG_PASS,
      database: process.env.PG_DB,
    }
);

module.exports = pool;
