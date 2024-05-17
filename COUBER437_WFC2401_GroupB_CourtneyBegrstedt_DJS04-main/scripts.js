// scripts.js
import { books, authors, genres, BOOKS_PER_PAGE } from './data.js';

class BookPreview extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                .preview {
                    display: flex;
                    align-items: center;
                    padding: 10px;
                    border: 1px solid #ccc;
                    margin-bottom: 10px;
                    cursor: pointer;
                }
                .preview__image {
                    width: 50px;
                    height: 75px;
                    object-fit: cover;
                    margin-right: 10px;
                }
                .preview__info {
                    display: flex;
                    flex-direction: column;
                }
                .preview__title {
                    font-size: 1.1em;
                    margin: 0;
                }
                .preview__author {
                    font-size: 0.9em;
                    color: #555;
                }
            </style>
            <button class="preview" data-preview>
                <img class="preview__image" />
                <div class="preview__info">
                <button class="preview" data-preview>
                <img class="preview__image" />
                <div class="preview__info">
                    <h3 class="preview__title"></h3>
                    <div class="preview__author"></div>
                </div>
            </button>
        `;
    }

    connectedCallback() {
        this.shadowRoot.querySelector('.preview').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('preview-click', {
                detail: this.getAttribute('data-preview'),
                bubbles: true,
                composed: true
            }));
        });
    }

    static get observedAttributes() {
        return ['data-preview', 'data-image', 'data-title', 'data-author'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'data-preview':
                this.shadowRoot.querySelector('.preview').setAttribute('data-preview', newValue);
                break;
            case 'data-image':
                this.shadowRoot.querySelector('.preview__image').src = newValue;
                break;
            case 'data-title':
                this.shadowRoot.querySelector('.preview__title').innerText = newValue;
                break;
            case 'data-author':
                this.shadowRoot.querySelector('.preview__author').innerText = authors[newValue];
                break;
        }
    }
}

customElements.define('book-preview', BookPreview);

class BookList extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                .list {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .list__items {
                    width: 100%;
                }
                .list__button {
                    padding: 10px;
                    margin-top: 10px;
                    cursor: pointer;
                }
            </style>
            <div class="list">
                <div class="list__message" data-list-message>No results found</div>
                <div class="list__items" data-list-items></div>
                <button class="list__button" data-list-button>Show more</button>
            </div>
        `;
        this.page = 1;
        this.matches = books;
    }

    connectedCallback() {
        this.renderBooks(this.matches);

        this.shadowRoot.querySelector('[data-list-button]').addEventListener('click', () => {
            this.loadMoreBooks();
        });
    }

    renderBooks(matches) {
        const fragment = document.createDocumentFragment();
        matches.slice(0, BOOKS_PER_PAGE * this.page).forEach((book) => {
            const element = document.createElement('book-preview');
            element.setAttribute('data-preview', book.id);
            element.setAttribute('data-image', book.image);
            element.setAttribute('data-title', book.title);
            element.setAttribute('data-author', book.author);
            fragment.appendChild(element);
        });
        this.shadowRoot.querySelector('[data-list-items]').appendChild(fragment);
    }

    loadMoreBooks() {
        this.page += 1;
        this.renderBooks(this.matches);
    }
}

customElements.define('book-list', BookList);

class SearchForm extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                .overlay__form {
                    display: flex;
                    flex-direction: column;
                    padding: 20px;
                }
                .overlay__field {
                    margin-bottom: 10px;
                }
                .overlay__input {
                    width: 100%;
                    padding: 8px;
                    margin-top: 5px;
                }
                .overlay__button {
                    padding: 10px;
                    cursor: pointer;
                }
                .overlay__button_primary {
                    background-color: blue;
                    color: white;
                }
            </style>
            <form class="overlay__form" data-search-form>
                <div class="overlay__content">
                    <h2 class="overlay__title">Search</h2>
                    <div class="overlay__field">
                        <label class="overlay__label" for="search-title">Title</label>
                        <input class="overlay__input" type="text" id="search-title" name="title" data-search-title>
                    </div>
                    <div class="overlay__field">
                        <label class="overlay__label" for="search-author">Author</label>
                        <select class="overlay__input overlay__input_select" id="search-author" name="author" data-search-authors></select>
                    </div>
                    <div class="overlay__field">
                        <label class="overlay__label" for="search-genre">Genre</label>
                        <select class="overlay__input overlay__input_select" id="search-genre" name="genre" data-search-genres></select>
                    </div>
                    <div class="overlay__row">
                        <button class="overlay__button" type="button" data-search-cancel>Cancel</button>
                        <button class="overlay__button overlay__button_primary" type="submit">Search</button>
                    </div>
                </div>
            </form>
        `;
    }

    connectedCallback() {
        const cancelButton = this.shadowRoot.querySelector('[data-search-cancel]');
        cancelButton.addEventListener('click', () => {
            this.closest('dialog').close();
        });

        const form = this.shadowRoot.querySelector('[data-search-form]');
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const formData = new FormData(form);
            const filters = Object.fromEntries(formData);
            this.dispatchEvent(new CustomEvent('search-submit', {
                detail: filters,
                bubbles: true,
                composed: true
            }));
            this.closest('dialog').close();
        });

        this.renderDropdownOptions(authors, 'authors');
        this.renderDropdownOptions(genres, 'genres');
    }

    renderDropdownOptions(data, selector) {
        const selectElement = this.shadowRoot.querySelector(`[data-search-${selector}]`);
        selectElement.innerHTML = `<option value="any">All ${selector}</option>`;
        Object.entries(data).forEach(([id, name]) => {
            const optionElement = document.createElement('option');
            optionElement.value = id;
            optionElement.textContent = name;
            selectElement.appendChild(optionElement);
        });
    }
}

customElements.define('search-form', SearchForm);

class SettingsForm extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                .overlay__form {
                    display: flex;
                    flex-direction: column;
                    padding: 20px;
                }
                .overlay__field {
                    margin-bottom: 10px;
                }
                .overlay__input {
                    width: 100%;
                    padding: 8px;
                    margin-top: 5px;
                }
                .overlay__button {
                    padding: 10px;
                    cursor: pointer;
                }
                .overlay__button_primary {
                    background-color: blue;
                    color: white;
                }
            </style>
            <form class="overlay__form" data-settings-form>
                <div class="overlay__content">
                    <h2 class="overlay__title">Settings</h2>
                    <div class="overlay__field">
                        <label class="overlay__label" for="settings-theme">Theme</label>
                        <select class="overlay__input overlay__input_select" id="settings-theme" name="theme" data-settings-theme>
                            <option value="day">Day</option>
                            <option value="night">Night</option>
                        </select>
                    </div>
                    <div class="overlay__row">
                        <button class="overlay__button" type="button" data-settings-cancel>Cancel</button>
                        <button class="overlay__button overlay__button_primary" type="submit">Save</button>
                    </div>
                </div>
            </form>
        `;
    }

    connectedCallback() {
        const cancelButton = this.shadowRoot.querySelector('[data-settings-cancel]');
        cancelButton.addEventListener('click', () => {
            this.closest('dialog').close();
        });

        const formData = new FormData(form);
        const { theme } = Object.fromEntries(formData);
        const darkColor = theme === 'night' ? '255, 255, 255' : '10, 10, 20';
        const lightColor = theme === 'night' ? '10, 10, 20' : '255, 255, 255';
        document.documentElement.style.setProperty('--color-dark', darkColor);
        document.documentElement.style.setProperty('--color-light', lightColor);
        this.closest('dialog').close();

                   // scripts.js

        this.initializeTheme();
    }

    initializeTheme() {
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = prefersDarkMode ? 'night' : 'day';
        this.shadowRoot.querySelector('[data-settings-theme]').value = theme;
    }
}

customElements.define('settings-form', SettingsForm);

// Other parts of the application logic

// Event listeners for other elements can be added here, like the header buttons

// Initialize components
const bookList = document.createElement('book-list');
const searchForm = document.createElement('search-form');
const settingsForm = document.createElement('settings-form');

document.body.appendChild(bookList);
document.body.appendChild(searchForm);
document.body.appendChild(settingsForm);

// Example event listeners:
searchForm.addEventListener('search-submit', (event) => {
    const filters = event.detail;
    // Handle search submit event, filter books based on the filters
    console.log('Search filters:', filters);
});

// For the 'preview-click' event, you can listen for it on the document or a parent element.
document.addEventListener('preview-click', (event) => {
    const bookId = event.detail;
    // Handle book preview click event
    console.log('Preview clicked for book ID:', bookId);
});
