// DOM references — owned here, used only for rendering
const feedList = document.querySelector('#feed-list');
const myBookmarksList = document.querySelector('#my-bookmarks-list');
const currentUsernameEl = document.querySelector('#current-username');
const guestControls = document.querySelector('#guest-controls');
const authControls = document.querySelector('#auth-controls');
const authSection = document.querySelector('#auth-section');
const feedSection = document.querySelector('#feed-section');
const myBookmarksSection = document.querySelector('#my-bookmarks-section');
const showMyBookmarksBtn = document.querySelector('#show-my-bookmarks-btn');

const renderFeed = (bookmarks, currentUser, likedBookmarkIds = []) => {
  feedList.innerHTML = '';
  bookmarks.forEach((bookmark) => {
    const isLiked = likedBookmarkIds.includes(bookmark.bookmark_id);

    const li = document.createElement('li');
    li.className = 'bookmark-card';

    const bookmarkInfo = document.createElement('div');
    bookmarkInfo.className = 'bookmark-info';

    const link = document.createElement('a');
    link.href = bookmark.url;
    link.target = '_blank'; // Open link in new tab
    link.textContent = bookmark.title;

    const meta = document.createElement('span');
    meta.className = 'bookmark-meta';
    meta.textContent = `by @${bookmark.username}`;

    bookmarkInfo.append(link, meta);

    const bookmarkActions = document.createElement('div');
    bookmarkActions.className = 'bookmark-actions';

    const likeBtn = document.createElement('button');
    likeBtn.className = `like-btn ${isLiked ? 'liked' : ''}`;
    likeBtn.dataset.bookmarkId = bookmark.bookmark_id;
    likeBtn.disabled = !currentUser;
    likeBtn.textContent = `${isLiked ? '♥' : '♡'} ${bookmark.like_count}`;

    bookmarkActions.append(likeBtn);
    li.append(bookmarkInfo, bookmarkActions);
    feedList.append(li);
  });
};

const renderMyBookmarks = (bookmarks) => {
  myBookmarksList.innerHTML = '';
  bookmarks.forEach((bookmark) => {
    const li = document.createElement('li');
    li.className = 'bookmark-card';

    const link = document.createElement('a');
    link.href = bookmark.url;
    link.target = '_blank';
    link.textContent = bookmark.title;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.dataset.bookmarkId = bookmark.bookmark_id;
    deleteBtn.textContent = 'Delete';

    li.append(link, deleteBtn);
    myBookmarksList.append(li);
  });
};

const renderAuthView = (currentUser) => {
  if (currentUser) {
    currentUsernameEl.textContent = `@${currentUser.username}`;
    guestControls.classList.add('hidden');
    authControls.classList.remove('hidden');
    authSection.classList.add('hidden');
    myBookmarksSection.classList.remove('hidden');
    showMyBookmarksBtn.classList.remove('hidden');
  } else {
    guestControls.classList.remove('hidden');
    authControls.classList.add('hidden');
    authSection.classList.add('hidden');
    myBookmarksSection.classList.add('hidden');
    showMyBookmarksBtn.classList.add('hidden');
  }
};

const showAuthSection = () => {
  authSection.classList.remove('hidden');
};

const showFeedSection = () => {
  feedSection.classList.remove('hidden');
  myBookmarksSection.classList.add('hidden');
};

const showMyBookmarksSection = () => {
  feedSection.classList.add('hidden');
  myBookmarksSection.classList.remove('hidden');
};

export {
  renderFeed,
  renderMyBookmarks,
  renderAuthView,
  showAuthSection,
  showFeedSection,
  showMyBookmarksSection,
};
