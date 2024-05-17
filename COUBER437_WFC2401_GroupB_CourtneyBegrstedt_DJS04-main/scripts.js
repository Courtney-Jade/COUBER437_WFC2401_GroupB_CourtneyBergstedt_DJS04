import { books, authors, genres, BOOKS_PER_PAGE } from './data.js'

// App state that tracks current page and matched books
const app = {
   page: 1,
   books: books,
   authors: authors,
   genres: genres,
   matches: books
}

// Function to render book list of book previews
function renderBookList(books, container) {
   const fragment = document.createDocumentFragment();
   for (const { author, id, image, title } of books) {
       const element = document.createElement('button');
       element.classList = 'preview';
       element.setAttribute('data-preview', id);
       element.innerHTML = `
           <img class="preview__image" src="${image}" />
           <div class="preview__info">
               <h3 class="preview__title">${title}</h3>
               <div class="preview__author">${app.authors[author]}</div>
           </div>
       `;
       fragment.appendChild(element);
   }
   container.appendChild(fragment);
}

// Function to create dropdown options for genres and authors
function createDropdownOptions(data, container, defaultOption) {
   const fragment = document.createDocumentFragment();
   const firstElement = document.createElement('option');
   firstElement.value = 'any';
   firstElement.innerText = defaultOption;
   fragment.appendChild(firstElement);
   for (const [id, name] of Object.entries(data)) {
       const element = document.createElement('option');
       element.value = id;
       element.innerText = name;
       fragment.appendChild(element);
   }
   container.appendChild(fragment);
}

// Function to apply selected theme
function applyTheme(theme) {
   if (theme === 'night') {
       document.documentElement.style.setProperty('--color-dark', '255, 255, 255');
       document.documentElement.style.setProperty('--color-light', '10, 10, 20');
   } else {
       document.documentElement.style.setProperty('--color-dark', '10, 10, 20');
       document.documentElement.style.setProperty('--color-light', '255, 255, 255');
   }
}

// Function to setup event listeners for various user interactions
function setupEventListeners() {
   //Close search overlay
   document.querySelector('[data-search-cancel]').addEventListener('click', () => {
       document.querySelector('[data-search-overlay]').open = false;
   });
    
   // Close search overlay
   document.querySelector('[data-settings-cancel]').addEventListener('click', () => {
       document.querySelector('[data-settings-overlay]').open = false;
   });

   document.querySelector('[data-header-search]').addEventListener('click', () => {
       document.querySelector('[data-search-overlay]').open = true;
       document.querySelector('[data-search-title]').focus();
   });

   document.querySelector('[data-header-settings]').addEventListener('click', () => {
       document.querySelector('[data-settings-overlay]').open = true;
   });

   document.querySelector('[data-list-close]').addEventListener('click', () => {
       document.querySelector('[data-list-active]').open = false;
   });

    //Handles theme change from settings
   document.querySelector('[data-settings-form]').addEventListener('submit', (event) => {
       event.preventDefault();
       const formData = new FormData(event.target);
       const { theme } = Object.fromEntries(formData);
       applyTheme(theme);
       document.querySelector('[data-settings-overlay]').open = false;
   });

   document.querySelector('[data-search-form]').addEventListener('submit', (event) => {
       event.preventDefault();
       const formData = new FormData(event.target);
       const filters = Object.fromEntries(formData);
       filterBooks(filters);
   });

   document.querySelector('[data-list-button]').addEventListener('click', () => {
       loadMoreBooks();
   });

   document.querySelector('[data-list-items]').addEventListener('click', (event) => {
       showBookDetails(event);
   });
}

// Function to filter books based on user input
function filterBooks(filters) {
   const result = [];
   for (const book of app.books) {
       let genreMatch = filters.genre === 'any';
       for (const singleGenre of book.genres) {
           if (genreMatch) break;
           if (singleGenre === filters.genre) genreMatch = true;
       }
       if (
           (filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase())) &&
           (filters.author === 'any' || book.author === filters.author) &&
           genreMatch
       ) {
           result.push(book);
       }
   }
   app.page = 1;
   app.matches = result;
   updateBookList(result);
}

// Function shows detailed information about a book
function showBookDetails(event) {
   const pathArray = Array.from(event.path || event.composedPath());
   let active = null;
   for (const node of pathArray) {
       if (active) break;
       if (node?.dataset?.preview) {
           let result = null;
           for (const singleBook of app.books) {
               if (result) break;
               if (singleBook.id === node?.dataset?.preview) result = singleBook;
           }
           active = result;
       }
   }
   if (active) {
       document.querySelector('[data-list-active]').open = true;
       document.querySelector('[data-list-blur]').src = active.image;
       document.querySelector('[data-list-image]').src = active.image;
       document.querySelector('[data-list-title]').innerText = active.title;
       document.querySelector('[data-list-subtitle]').innerText = `${app.authors[active.author]} (${new Date(active.published).getFullYear()})`;
       document.querySelector('[data-list-description]').innerText = active.description;
   }
}

// Function to update book list
function updateBookList(books) {
   const listContainer = document.querySelector('[data-list-items]');
   listContainer.innerHTML = '';
   if (books.length < 1) {
       document.querySelector('[data-list-message]').classList.add('list__message_show');
   } else {
       document.querySelector('[data-list-message]').classList.remove('list__message_show');
       renderBookList(books.slice(0, BOOKS_PER_PAGE), listContainer);
   }
   const showMoreButton = document.querySelector('[data-list-button]');
   showMoreButton.disabled = (books.length - (app.page * BOOKS_PER_PAGE)) < 1;
   showMoreButton.innerHTML = `
       <span>Show more</span>
       <span class="list__remaining"> (${(books.length - (app.page * BOOKS_PER_PAGE)) > 0 ? (books.length - (app.page * BOOKS_PER_PAGE)) : 0})</span>
   `;
   window.scrollTo({ top: 0, behavior: 'smooth' });
   document.querySelector('[data-search-overlay]').open = false;
}

// Function to load more books when "Show more" button is clicked
function loadMoreBooks() {
   const fragment = document.createDocumentFragment();
   const start = app.page * BOOKS_PER_PAGE;
   const end = (app.page + 1) * BOOKS_PER_PAGE;
   renderBookList(app.matches.slice(start, end), fragment);
   document.querySelector('[data-list-items]').appendChild(fragment);
   app.page += 1;
}

// Initial render and event listener setup
document.addEventListener('DOMContentLoaded', () => {
   const listContainer = document.querySelector('[data-list-items]');
   renderBookList(app.books.slice(0, BOOKS_PER_PAGE), listContainer);
   createDropdownOptions(app.genres, document.querySelector('[data-search-genres]'), 'All Genres');
   createDropdownOptions(app.authors, document.querySelector('[data-search-authors]'), 'All Authors');
   if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
       applyTheme('night');
       document.querySelector('[data-settings-theme]').value = 'night';
   } else {
       applyTheme('day');
       document.querySelector('[data-settings-theme]').value = 'day';
   }
   setupEventListeners();
   document.querySelector('[data-list-button]').innerText = `Show more (${app.books.length - BOOKS_PER_PAGE})`;
   document.querySelector('[data-list-button]').disabled = (app.matches.length - (app.page * BOOKS_PER_PAGE)) <= 0;
});