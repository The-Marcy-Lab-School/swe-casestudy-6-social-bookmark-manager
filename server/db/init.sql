CREATE TABLE IF NOT EXISTS users (
  user_id       SERIAL PRIMARY KEY,
  username      TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS bookmarks (
  bookmark_id SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  url         TEXT NOT NULL,
  user_id     INT REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bookmark_likes (
  user_id     INT REFERENCES users(user_id) ON DELETE CASCADE,
  bookmark_id INT REFERENCES bookmarks(bookmark_id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, bookmark_id)
);
