const bookmarkModel = require('../models/bookmarkModel');

module.exports.listBookmarks = async (req, res, next) => {
  try {
    const bookmarks = await bookmarkModel.list();
    res.send(bookmarks);
  } catch (err) {
    next(err);
  }
};

module.exports.listUserBookmarks = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const bookmarks = await bookmarkModel.listByUser(user_id);
    res.send(bookmarks);
  } catch (err) {
    next(err);
  }
};

module.exports.createBookmark = async (req, res, next) => {
  try {
    const { title, url } = req.body;
    if (!title || !url) {
      return res.status(400).send({ error: 'Title and URL are required.' });
    }
    const bookmark = await bookmarkModel.create(title, url, req.session.user_id);
    res.status(201).send(bookmark);
  } catch (err) {
    next(err);
  }
};

module.exports.deleteBookmark = async (req, res, next) => {
  try {
    const { bookmark_id } = req.params;
    const bookmark = await bookmarkModel.find(bookmark_id);
    if (!bookmark) return res.status(404).send({ error: 'Bookmark not found.' });
    if (bookmark.user_id !== req.session.user_id) {
      return res.status(403).send({ error: 'You do not have permission to delete this bookmark.' });
    }
    await bookmarkModel.destroy(bookmark_id);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

module.exports.likeBookmark = async (req, res, next) => {
  try {
    const { bookmark_id } = req.params;
    const likeDidSucceed = await bookmarkModel.like(bookmark_id, req.session.user_id);
    if (!likeDidSucceed) return res.status(200).send(true); // like already exists
    res.status(201).send(true);
  } catch (err) {
    next(err);
  }
};

module.exports.unlikeBookmark = async (req, res, next) => {
  try {
    const { bookmark_id } = req.params;
    await bookmarkModel.unlike(bookmark_id, req.session.user_id);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

module.exports.listLikedBookmarkIds = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const ids = await bookmarkModel.likedByUser(user_id);
    res.send(ids);
  } catch (err) {
    next(err);
  }
};

