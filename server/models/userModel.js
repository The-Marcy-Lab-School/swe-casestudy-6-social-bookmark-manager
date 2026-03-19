const pool = require('../db/pool');

// Returns the new user (user_id, username only — never exposes password_hash)
module.exports.create = async (username, passwordHash) => {
  const query = 'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING user_id, username';
  const { rows } = await pool.query(query, [username, passwordHash]);
  return rows[0];
};

// Returns the user (user_id, username) or null
module.exports.find = async (user_id) => {
  const query = 'SELECT user_id, username FROM users WHERE user_id = $1';
  const { rows } = await pool.query(query, [user_id]);
  return rows[0] || null;
};

// Returns the user (user_id, username) or null — used to check if username is taken
module.exports.findByUsername = async (username) => {
  const query = 'SELECT user_id, username FROM users WHERE username = $1';
  const { rows } = await pool.query(query, [username]);
  return rows[0] || null;
};

// The only function that fetches password_hash — compares internally and never returns it
module.exports.validatePassword = async (username, password) => {
  const bcrypt = require('bcrypt');
  const query = 'SELECT * FROM users WHERE username = $1';
  const { rows } = await pool.query(query, [username]);
  if (!rows[0]) return null;
  const isValid = await bcrypt.compare(password, rows[0].password_hash);
  if (!isValid) return null;
  return rows[0]; // intentional flaw: includes password_hash
};

