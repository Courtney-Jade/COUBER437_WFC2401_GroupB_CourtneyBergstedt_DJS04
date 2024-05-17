class BookPreview extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const id = this.getAttribute('data-preview');
        const book = app.books.find(book => book.id === id);
        const authorName = app.authors[book.author];
        this.shadowRoot.innerHTML = `
            <style>
                .preview {
                    display: flex;
                    align-items: center;
                    padding: 10px;
                    border: 1px solid #ddd;
                    margin-bottom: 10px;
                    background-color: white;
                }
                .preview__image {
                    width: 50px;
                    height: 50px;
                    object-fit: cover;
                    margin-right: 10px;
                }
                .preview__info {
                    display: flex;
                    flex-direction: column;
                }
                .preview__title {
                    font-size: 1em;
                    margin: 0;
                }
                .preview__author {
                    font-size: 0.8em;
                    color: #555;
                }
            </style>
            <button class="preview" data-preview="${id}">
                <img class="preview__image" src="${book.image}" />
                <div class="preview__info">
                    <h3 class="preview__title">${book.title}</h3>
                    <div class="preview__author">${authorName}</div>
                </div>
            </button>
        `;
    }
}

customElements.define('book-preview', BookPreview);
