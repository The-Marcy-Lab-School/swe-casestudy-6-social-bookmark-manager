const bcrypt = require('bcrypt');
const pool = require('./pool');

const SALT_ROUNDS = 12;

const seed = async () => {
  // 1. Drop and recreate tables for a clean slate
  // Drop in reverse dependency order to satisfy foreign key constraints.
  // bookmark_likes references both users and bookmarks, so it must be dropped first.
  await pool.query('DROP TABLE IF EXISTS bookmark_likes');
  await pool.query('DROP TABLE IF EXISTS bookmarks');
  await pool.query('DROP TABLE IF EXISTS users');

  await pool.query(`
    CREATE TABLE users (
      user_id       SERIAL PRIMARY KEY,
      username      TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE bookmarks (
      bookmark_id SERIAL PRIMARY KEY,
      title       TEXT NOT NULL,
      url         TEXT NOT NULL,
      user_id     INT REFERENCES users(user_id) ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE bookmark_likes (
      bookmark_likes_id SERIAL PRIMARY KEY,
      user_id           INT REFERENCES users(user_id) ON DELETE CASCADE,
      bookmark_id       INT REFERENCES bookmarks(bookmark_id) ON DELETE CASCADE,
      UNIQUE (user_id, bookmark_id)
    )
  `);

  // 2. Hash passwords for seed data
  // bcrypt.hash() is async, so Promise.all() runs all three hashes in parallel
  // instead of waiting for each one sequentially (~300ms per hash at 12 rounds).
  const [aliceHash, bobHash, carolHash] = await Promise.all([
    bcrypt.hash('password123', SALT_ROUNDS),
    bcrypt.hash('password123', SALT_ROUNDS),
    bcrypt.hash('password123', SALT_ROUNDS),
  ]);

  // 3. Insert seed data
  // RETURNING captures the inserted rows so we have the auto-generated user_ids.
  // This avoids hardcoding IDs, which would break if the sequence isn't reset.
  const { rows: users } = await pool.query(`
    INSERT INTO users (username, password_hash) VALUES
      ('alice', $1),
      ('bob',   $2),
      ('carol', $3)
    RETURNING user_id, username
  `, [aliceHash, bobHash, carolHash]);

  const [alice, bob, carol] = users;

  // Same pattern: RETURNING gives us the real bookmark_ids to use when seeding likes.
  const { rows: bookmarks } = await pool.query(`
    INSERT INTO bookmarks (title, url, user_id) VALUES
      ('MDN Web Docs',            'https://developer.mozilla.org',         $1),
      ('Node.js Documentation',   'https://nodejs.org/en/docs',            $1),
      ('PostgreSQL Documentation','https://www.postgresql.org/docs',       $2),
      ('Express.js Guide',        'https://expressjs.com/en/guide',        $2),
      ('JavaScript.info',         'https://javascript.info',               $3)
    RETURNING bookmark_id, title
  `, [alice.user_id, bob.user_id, carol.user_id]);

  const [mdn, node, postgres, express, jsinfo] = bookmarks;

  // bookmark_likes has a UNIQUE constraint on (user_id, bookmark_id),
  // so inserting a duplicate like (same user + same bookmark) would throw an error.
  // Each pair below must be unique.
  await pool.query(`
    INSERT INTO bookmark_likes (bookmark_id, user_id) VALUES
      ($1, $2),
      ($1, $3),
      ($1, $4),
      ($5, $2),
      ($5, $3),
      ($6, $2),
      ($7, $3),
      ($7, $4)
  `, [
    mdn.bookmark_id, // $1
    alice.user_id,   // $2
    bob.user_id,     // $3
    carol.user_id,   // $4
    node.bookmark_id,     // $5
    postgres.bookmark_id, // $6
    express.bookmark_id,  // $7
  ]);

  return { users, bookmarks };
};

seed()
  .then(({ users, bookmarks }) => {
    console.log('Database seeded successfully.');
    console.log(`  Users:     ${users.map((u) => u.username).join(', ')}`);
    console.log(`  Bookmarks: ${bookmarks.map((b) => b.title).join(', ')}`);
  })
  .catch((err) => {
    console.error('Error seeding database:', err);
    process.exit(1);
  })
  .finally(() => pool.end());
