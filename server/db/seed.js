const bcrypt = require('bcrypt');
const pool = require('./pool');

const SALT_ROUNDS = 12;

const seed = async () => {
  // Passwords must be hashed with bcrypt before storing — never insert plain text.
  // bcrypt.hash() is async, so Promise.all() runs all three hashes in parallel
  // instead of waiting for each one sequentially (~300ms per hash at 12 rounds).
  const [aliceHash, bobHash, carolHash] = await Promise.all([
    bcrypt.hash('password123', SALT_ROUNDS),
    bcrypt.hash('password123', SALT_ROUNDS),
    bcrypt.hash('password123', SALT_ROUNDS),
  ]);

  // Delete in reverse dependency order to satisfy foreign key constraints.
  // bookmark_likes references both users and bookmarks, so it must be cleared first.
  // Deleting from users or bookmarks first would violate those foreign key constraints.
  await pool.query('DELETE FROM bookmark_likes');
  await pool.query('DELETE FROM bookmarks');
  await pool.query('DELETE FROM users');

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

  // bookmark_likes has a composite primary key on (user_id, bookmark_id),
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
    mdn.bookmark_id, alice.user_id, bob.user_id, carol.user_id,
    node.bookmark_id,
    postgres.bookmark_id,
    express.bookmark_id,
    jsinfo.bookmark_id,
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
