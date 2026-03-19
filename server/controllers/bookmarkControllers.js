const bookmarkModel = require('../models/bookmarkModel');

module.exports.listBookmarks = async (req, res) => {
  const bookmarks = await bookmarkModel.list();
  res.send(bookmarks);
};

module.exports.listUserBookmarks = async (req, res) => {
  const { user_id } = req.params;
  const bookmarks = await bookmarkModel.listByUser(user_id);
  res.send(bookmarks);
};

module.exports.createBookmark = async (req, res) => {
  const { title, url } = req.body;
  if (!title || !url) {
    return res.status(400).send({ error: 'Title and URL are required.' });
  }
  const bookmark = await bookmarkModel.create(title, url, req.session.user_id);
  res.status(201).send(bookmark);
};

module.exports.deleteBookmark = async (req, res) => {
  const { bookmark_id } = req.params;
  const bookmark = await bookmarkModel.find(bookmark_id);
  if (!bookmark) return res.status(404).send({ error: 'Bookmark not found.' });
  if (bookmark.user_id !== req.session.user_id) {
    return res.status(403).send({ error: 'You do not have permission to delete this bookmark.' });
  }
  await bookmarkModel.destroy(bookmark_id);
  res.sendStatus(204);
};

module.exports.likeBookmark = async (req, res) => {
  const { bookmark_id } = req.params;
  const like = await bookmarkModel.like(bookmark_id, req.session.user_id);
  if (!like) return res.sendStatus(200); // already liked
  res.status(201).send(like);
};

module.exports.unlikeBookmark = async (req, res) => {
  const { bookmark_id } = req.params;
  await bookmarkModel.unlike(bookmark_id, req.session.user_id);
  res.sendStatus(204);
};

module.exports.listLikedBookmarkIds = async (req, res) => {
  const { user_id } = req.params;
  const ids = await bookmarkModel.likedByUser(user_id);
  res.send(ids);
};

