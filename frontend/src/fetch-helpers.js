// A single function to handle fetches with try/catch and return a standard { data, error } shape
const handleFetch = async (url, config) => {
  try {
    const response = await fetch(url, config);
    if (!response.ok) throw new Error(`Fetch failed. ${response.status} ${response.statusText}`);
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// If this API udpates to a new version (e.g. /api/v2) we only need to change it here.
const baseURL = '/api';

// ============================================
// Authentication & Authorization
// ============================================

const getCurrentUser = async () => {
  const { data } = await handleFetch(`${baseURL}/auth/me`);
  // If an error occurred, we simply assume that they are not logged in and return { data: null }
  // If the fetch succeeded, we are returning the user
  return { data };
};

const register = (username, password) => {
  const config = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  };
  return handleFetch(`${baseURL}/auth/register`, config);
};

const login = (username, password) => {
  const config = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  };
  return handleFetch(`${baseURL}/auth/login`, config);
};

const logout = () => {
  const config = { method: 'DELETE' };
  return handleFetch(`${baseURL}/auth/logout`, config);
};

// ============================================
// Bookmarks
// ============================================

const getBookmarks = () => {
  return handleFetch(`${baseURL}/bookmarks`);
};

const createBookmark = (title, url) => {
  const config = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, url }),
  };
  return handleFetch(`${baseURL}/bookmarks`, config);
};

const deleteBookmark = (bookmark_id) => {
  const config = { method: 'DELETE' };
  return handleFetch(`${baseURL}/bookmarks/${bookmark_id}`, config);
};

const likeBookmark = (bookmark_id) => {
  const config = { method: 'POST' };
  return handleFetch(`${baseURL}/bookmarks/${bookmark_id}/likes`, config);

};

const unlikeBookmark = (bookmark_id) => {
  const config = { method: 'DELETE' };
  return handleFetch(`${baseURL}/bookmarks/${bookmark_id}/likes`, config);
};

// ============================================
// My Bookmarks
// ============================================

const getMyBookmarks = (user_id) => {
  return handleFetch(`${baseURL}/users/${user_id}/bookmarks`);
};

const getLikedBookmarkIds = (user_id) => {
  return handleFetch(`${baseURL}/users/${user_id}/likes`);
};

export {
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
};
