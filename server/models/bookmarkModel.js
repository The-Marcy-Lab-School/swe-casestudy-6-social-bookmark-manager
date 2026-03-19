const pool = require('../db/pool');

// Returns all bookmarks with owner username and like count, sorted by likes descending
module.exports.list = async () => {
  const query = `
    SELECT
      bookmarks.bookmark_id,
      bookmarks.title,
      bookmarks.url,
      bookmarks.user_id,
      users.username,
      COUNT(bookmark_likes.user_id) AS like_count
    FROM bookmarks
    INNER JOIN users ON bookmarks.user_id = users.user_id
    LEFT JOIN bookmark_likes ON bookmarks.bookmark_id = bookmark_likes.bookmark_id
    GROUP BY bookmarks.bookmark_id, users.user_id
    ORDER BY like_count DESC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

// Returns all bookmarks for a specific user (no JOIN needed)
module.exports.listByUser = async (user_id) => {
  const query = 'SELECT bookmark_id, title, url FROM bookmarks WHERE user_id = $1';
  const { rows } = await pool.query(query, [user_id]);
  return rows;
};

// Returns a single bookmark row (including user_id for ownership checks)
module.exports.find = async (bookmark_id) => {
  const query = 'SELECT * FROM bookmarks WHERE bookmark_id = $1';
  const { rows } = await pool.query(query, [bookmark_id]);
  return rows[0] || null;
};

// Returns the newly created bookmark
module.exports.create = async (title, url, user_id) => {
  const query = 'INSERT INTO bookmarks (title, url, user_id) VALUES ($1, $2, $3) RETURNING *';
  const { rows } = await pool.query(query, [title, url, user_id]);
  return rows[0];
};

// Deletes a bookmark; ON DELETE CASCADE removes associated likes automatically
module.exports.destroy = async (bookmark_id) => {
  const query = 'DELETE FROM bookmarks WHERE bookmark_id = $1';
  await pool.query(query, [bookmark_id]);
};

// Inserts a like — ON CONFLICT DO NOTHING silently skips duplicate likes
// Returns the new row, or null if the user had already liked this bookmark
module.exports.like = async (bookmark_id, user_id) => {
  const query = 'INSERT INTO bookmark_likes (bookmark_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *';
  const { rows } = await pool.query(query, [bookmark_id, user_id]);
  return rows[0] || null;
};

// Removes a like
module.exports.unlike = async (bookmark_id, user_id) => {
  const query = 'DELETE FROM bookmark_likes WHERE bookmark_id = $1 AND user_id = $2';
  await pool.query(query, [bookmark_id, user_id]);
};

// Returns a flat array of bookmark_ids that a user has liked
module.exports.likedByUser = async (user_id) => {
  const query = 'SELECT bookmark_id FROM bookmark_likes WHERE user_id = $1';
  const { rows } = await pool.query(query, [user_id]);
  return rows.map((row) => row.bookmark_id);
};
