import {
  getCurrentUser,
  register,
  login,
  logout,
  getBookmarks,
  getMyBookmarks,
  getLikedBookmarkIds,
  createBookmark,
  deleteBookmark,
  likeBookmark,
  unlikeBookmark,
} from './fetch-helpers.js';

import {
  renderFeed,
  renderMyBookmarks,
  renderAuthView,
  showAuthSection,
  showFeedSection,
  showMyBookmarksSection,
} from './dom-helpers.js';

// ================================================
// DOM References
// ================================================

const loginForm = document.querySelector('#login-form');
const registerForm = document.querySelector('#register-form');
const addBookmarkForm = document.querySelector('#add-bookmark-form');
const showAuthBtn = document.querySelector('#show-auth-btn');
const logoutBtn = document.querySelector('#logout-btn');
const showFeedBtn = document.querySelector('#show-feed-btn');
const showMyBookmarksBtn = document.querySelector('#show-my-bookmarks-btn');
const feedList = document.querySelector('#feed-list');
const myBookmarksList = document.querySelector('#my-bookmarks-list');

// ================================================
// In Memory Data
// ================================================

let currentUser = null;
let likedBookmarkIds = [];

// ================================================
// Refresh Helpers
// ================================================

const refreshLikedIds = async () => {
  if (!currentUser) {
    likedBookmarkIds = [];
    return;
  }
  const { data: ids } = await getLikedBookmarkIds(currentUser.user_id);
  likedBookmarkIds = ids || [];
};

const refreshFeed = async () => {
  const { data: bookmarks } = await getBookmarks();
  renderFeed(bookmarks || [], currentUser, likedBookmarkIds);
};

const refreshMyBookmarks = async () => {
  if (!currentUser) return;
  const { data: bookmarks } = await getMyBookmarks(currentUser.user_id);
  renderMyBookmarks(bookmarks || []);
};

// ================================================
// Event Handlers
// ================================================

// Registering: Send Request -> Update View to "User Mode" -> Refresh Likes/Feed
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const { data: user } = await register(registerForm.username.value, registerForm.password.value);
  if (!user) return;
  currentUser = user;
  renderAuthView(currentUser);
  registerForm.reset();
  await refreshLikedIds();
  await refreshFeed();
});

// Logging In: Send Request -> Update View to "User Mode" -> Refresh Likes/Feed/My Bookmarks
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const { data: user } = await login(loginForm.username.value, loginForm.password.value);
  if (!user) return;
  currentUser = user;
  renderAuthView(currentUser);
  loginForm.reset();
  await refreshLikedIds();
  await refreshFeed();
  await refreshMyBookmarks();
});

// Logging Out: Send Request -> Update View to "Guest Mode" -> Refresh Feed (Remove Like Ability)
logoutBtn.addEventListener('click', async () => {
  await logout();
  currentUser = null;
  likedBookmarkIds = [];
  renderAuthView(null);
  await refreshFeed();
});

// Creating a Bookmark: Send Request -> Refresh Feed/My Bookmarks
addBookmarkForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  await createBookmark(addBookmarkForm.title.value, addBookmarkForm.url.value);
  addBookmarkForm.reset();
  await refreshFeed();
  await refreshMyBookmarks();
});

// Liking a Bookmark: Find Bookmark ID -> Send Request -> Refresh Likes/Feed
feedList.addEventListener('click', async (e) => {
  const likeBtn = e.target.closest('.like-btn');
  if (!likeBtn) return;
  const bookmarkId = Number(likeBtn.dataset.bookmarkId);
  if (likedBookmarkIds.includes(bookmarkId)) {
    await unlikeBookmark(bookmarkId);
  } else {
    await likeBookmark(bookmarkId);
  }
  await refreshLikedIds();
  await refreshFeed();
});

// Deleting a Bookmark: Find Bookmark ID -> Send Request -> Refresh Feed/My Bookmarks
myBookmarksList.addEventListener('click', async (e) => {
  const deleteBtn = e.target.closest('.delete-btn');
  if (!deleteBtn) return;
  await deleteBookmark(deleteBtn.dataset.bookmarkId);
  await refreshFeed();
  await refreshMyBookmarks();
});

// Change View to "My Bookmarks"
showMyBookmarksBtn.addEventListener('click', async () => {
  showMyBookmarksSection();
  await refreshMyBookmarks();
});

// Change View to "Feed"
showFeedBtn.addEventListener('click', showFeedSection);

// Show Log In / Register
showAuthBtn.addEventListener('click', showAuthSection);

// Check For Current User -> Update View -> Refresh Likes/Feed/My Bookmarks
const main = async () => {
  const { data } = await getCurrentUser();
  currentUser = data;
  renderAuthView(currentUser);
  await refreshLikedIds();
  await refreshFeed();
  await refreshMyBookmarks();
};

main();
