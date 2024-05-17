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
            <button class="preview">
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
