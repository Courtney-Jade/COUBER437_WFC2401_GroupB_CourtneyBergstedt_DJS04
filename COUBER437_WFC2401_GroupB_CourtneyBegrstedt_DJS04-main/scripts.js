import { bookData, authors, genres, BOOKS_PER_PAGE } from './data.js';

class BookPreview extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }
  
    static get observedAttributes() {
      return ['book'];
    }
  
    attributeChangedCallback(name, oldValue, newValue) {
      if (name === 'book') {
        this.render(JSON.parse(newValue));
      }
    }
  
    render(book) {
      const { id, title, author, image } = book;
      const authorName = authors[author];
  
      this.shadowRoot.innerHTML = `
        <style>
          .preview {
            display: flex;
            align-items: center;
            cursor: pointer;
          }
  
          .preview__image {
            width: 100px;
            height: 150px;
            object-fit: cover;
            margin-right: 1rem;
          }
  
          .preview__info {
            /* Add any additional styles for the info section */
          }
        </style>
        <div class="preview" data-preview="${id}">
          <img class="preview__image" src="${image}" alt="${title}">
          <div class="preview__info">
            <h3 class="preview__title">${title}</h3>
            <div class="preview__author">${authorName}</div>
          </div>
        </div>
      `;
    }
  }
  
  customElements.define('book-preview', BookPreview);

  import './book-preview.js';

// ... (other code)

const renderBookList = (bookList) => {
  const fragment = document.createDocumentFragment();

  for (const book of bookList.slice(0, BOOKS_PER_PAGE)) {
    const previewElement = document.createElement('book-preview');
    previewElement.setAttribute('book', JSON.stringify(book));
    fragment.appendChild(previewElement);
  }

  document.querySelector('[data-list-items]').appendChild(fragment);
};
