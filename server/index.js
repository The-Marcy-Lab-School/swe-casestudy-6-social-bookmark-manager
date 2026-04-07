// ====================================
// Imports / Constants
// ====================================

const path = require('path');
const express = require('express');
const cookieSession = require('cookie-session');
require('dotenv').config();

const logRoutes = require('./middleware/logRoutes');
const checkAuthentication = require('./middleware/checkAuthentication');
const authControllers = require('./controllers/authControllers');
const bookmarkControllers = require('./controllers/bookmarkControllers');

const app = express();
const PORT = process.env.PORT || 8080;

// Use dist (requires building the frontend) in production environment
const pathToFrontend = process.env.NODE_ENV === 'production' ? '../frontend/dist' : '../frontend';

// ====================================
// Middleware
// ====================================

app.use(logRoutes);
app.use(cookieSession({ name: 'session', secret: process.env.SESSION_SECRET })); // creates/parses cookie stored in req.session
app.use(express.json()); // parses requests and stores JSON data in req.body
app.use(express.static(path.join(__dirname, pathToFrontend)));

// ====================================
// Auth routes
// ====================================

app.post('/api/auth/register', authControllers.register);
app.post('/api/auth/login', authControllers.login);
app.get('/api/auth/me', authControllers.getMe);
app.delete('/api/auth/logout', authControllers.logout);

// ====================================
// Bookmark routes
// ====================================

app.get('/api/bookmarks', bookmarkControllers.listBookmarks);
app.post('/api/bookmarks', checkAuthentication, bookmarkControllers.createBookmark);
app.delete('/api/bookmarks/:bookmark_id', checkAuthentication, bookmarkControllers.deleteBookmark);
app.post('/api/bookmarks/:bookmark_id/likes', checkAuthentication, bookmarkControllers.likeBookmark);
app.delete('/api/bookmarks/:bookmark_id/likes', checkAuthentication, bookmarkControllers.unlikeBookmark);

// ====================================
// User routes
// ====================================

app.get('/api/users/:user_id/bookmarks', bookmarkControllers.listUserBookmarks);
app.get('/api/users/:user_id/likes', bookmarkControllers.listLikedBookmarkIds);

// ====================================
// Global Error Handling
// ====================================

// Notice that this error handler has **four** parameters.
const handleError = (err, req, res, next) => {
  console.error(err);
  res.status(500).send({ message: 'Internal Server Error' });
};
app.use(handleError);

// ====================================
// Listen
// ====================================

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
