// scripts.js
import { theme } from './theme.js';
import { bookList } from './bookList.js';
// import { authors } from './data.js';

theme.init();
bookList.init();

/**
 * Handles the search form submission.
 * @param {Event} event - The form submission event.
 */
function handleSearch(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const filters = Object.fromEntries(formData);
  const messageElement = document.querySelector('[data-list-message]');
  const searchOverlay = document.querySelector('[data-search-overlay]');
  bookList.filterBooks(filters, messageElement, searchOverlay);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Handles the settings form submission.
 * @param {Event} event - The form submission event.
 */
function handleSettingsSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const { theme: themeOption } = Object.fromEntries(formData);
  theme.toggleTheme();
  console.log(themeOption);
  document.querySelector('[data-settings-overlay]').open = false;
}

/**
 * Handles click events on the book list items.
 * @param {Event} event - The click event.
 */
function handleListClick(event) {
  const pathArray = Array.from(event.path || event.composedPath());
  let active = null;
  for (const node of pathArray) {
    if (active) break;
    if (node?.dataset?.preview) {
      const bookId = node.dataset.preview;
      active = bookList.matches.find((book) => book.id === bookId);
    }
  }
  const bookPreview = document.createElement('book-preview');
  bookPreview.book = active;
  document.body.appendChild(bookPreview);
  bookPreview.addEventListener('close', () => {
    document.body.removeChild(bookPreview);
  });
}
// Event listeners
document
  .querySelector('[data-search-form]')
  .addEventListener('submit', handleSearch);
document
  .querySelector('[data-settings-form]')
  .addEventListener('submit', handleSettingsSubmit);
// remember to move to preview component
document
  .querySelector('[data-list-items]')
  .addEventListener('click', handleListClick);
document
  .querySelector('[data-search-cancel]')
  .addEventListener(
    'click',
    () => (document.querySelector('[data-search-overlay]').open = false),
  );
document
  .querySelector('[data-settings-cancel]')
  .addEventListener(
    'click',
    () => (document.querySelector('[data-settings-overlay]').open = false),
  );
document.querySelector('[data-header-search]').addEventListener('click', () => {
  document.querySelector('[data-search-overlay]').open = true;
  document.querySelector('[data-search-title]').focus();
});
document
  .querySelector('[data-header-settings]')
  .addEventListener(
    'click',
    () => (document.querySelector('[data-settings-overlay]').open = true),
  );
document
  .querySelector('[data-list-close]')
  .addEventListener(
    'click',
    () => (document.querySelector('[data-list-active]').open = false),
  );
document
  .querySelector('[data-list-button]')
  .addEventListener('click', bookList.showMoreBooks.bind(bookList));
