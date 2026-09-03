import  ToDoApp from "../js/App.js";
import { APP_CONST } from "../js/const.js";
import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";

// Helper function: Sanitizes HTML natively without external lib (replaces DOMPurify)
function sanitizeHTML(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // 1. Alle potenziell gefährlichen Script-Tags restlos entfernen
    doc.querySelectorAll('script, iframe, object, embed').forEach(el => el.remove());
    
    // 2. Alle Event-Handler (wie onload, onerror) und JavaScript-Links säubern
    doc.querySelectorAll('*').forEach(el => {
        for (const attr of [...el.attributes]) {
            if (attr.name.startsWith('on')) {
                el.removeAttribute(attr.name);
            }
            if (attr.name === 'href' && attr.value.trim().toLowerCase().startsWith('javascript:')) {
                el.removeAttribute(attr.name);
            }
        }
    });
    return doc.body.innerHTML;
}

export class InfoPage {

    // constructor(app, content) {
    //     this.outerHTML = InfoPage.create(app, content);
    //     this.name = content[app.lang ?? APP_CONST.DEFAULT_SETTINGS.LANG].title;
    // }

    static create(app, content) {
        /**
         ** @param {ToDoApp} app - instance of the app
         ** @param {Object} content  - content of the Info page
         ** @returns {HTMLElement} container - a div element with the content inside
         */
        const container = document.createElement("div");
        container.className = "info-page-container";

        // Get the data in the user's language
        const data = content[app.lang ?? APP_CONST.DEFAULT_SETTINGS.LANG];

        // Read the symbol + title from data (if any) and create DOM elements
        // Append to the info page container
        if (data.title) {
            const titleRow = document.createElement("div");
            titleRow.className = "info-page-title-row";

            if (data.symbol) {
                const symbol = document.createElement("span");
                symbol.innerText = data.symbol;
                titleRow.appendChild(symbol);
            }

            const title = document.createElement("span");
            title.className = "info-page-title";
            title.innerText = data.title;
            titleRow.appendChild(title);

            container.appendChild(titleRow);
        }


        // Loop over the data, create the respective DOM elements 
        // and attach them to the container
        data.body.forEach(item => {
            const el = document.createElement(item.tagName);
            el.innerHTML = item.innerText;
            container.appendChild(el);
        });

        
        return container;
    }
    
    static async getMarkdown(URL) {
        /**
         ** @param {String} URL  - URL of the .md file
         ** @returns {String} text - the text content of the .md file
         */
        try {
            const response = await fetch(`${URL}`);
            
            if(!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);
            return await response.text();
            
        } catch (err) {
            console.error(`Error loading the readme file:`, err);
        }
    }

    static async fromMarkdown(app, URL) {
        /**
         ** @param {ToDoApp} app - instance of the app
         ** @param {String} URL  - URL of the .md file
         ** @returns {HTMLElement} container - a div element with the content inside
         */
        
        const readme = await InfoPage.getMarkdown(URL);
        if (!readme) return null; // error
        
        // Arrange for github-suiting heading IDs
        marked.use({
            walkTokens(token) {
                if (token.type === 'heading') {
                    // Erzeugt eine GitHub-typische ID: Kleinbuchstaben, Sonderzeichen weg, Leerzeichen zu Bindestrichen
                    token.id = token.text
                        .toLowerCase()
                        .trim()
                        .replace(/[^\w\s-]/g, '') // Entfernt Sonderzeichen
                        .replace(/[\s_]+/g, '-')  // Ersetzt Leerzeichen und Unterstriche durch Bindestriche
                        .replace(/^-+|-+$/g, ''); // Entfernt führende/endende Bindestriche
                }
            }
        });

        // Configure renderer
        const renderer = new marked.Renderer();

        renderer.heading = ({ text, depth, raw }) => {
            // Wir holen uns die ID, die wir in walkTokens generiert haben (oder bauen sie zur Sicherheit)
            const id = raw.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '');
            return `<h${depth} id="${id}">${text}</h${depth}>`;
        };

        renderer.link = ({ href, title, text }) => {
            const titleAttr = title ? ` title="${title}"` : "";

            // If the link begins with "#", it's an internal anchor link
            if (href.startsWith("#")) {
                return `<a href="${href}"${titleAttr}>${text}</a>`;
            }

            // Otherwise, in case of external links, open in a new tab
            return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`;
        }

        // Generate HTML
        const rawMarkup = marked.parse(readme, { renderer });

        // Clean up HTML - allows IDs for anchor reference
        const cleanMarkup = sanitizeHTML(rawMarkup);
        
        const container = document.createElement("div");
        container.className = "info-page-container";
        
        container.innerHTML = cleanMarkup;

        // add credits for marked.js at the end of the page
        const credits = document.createElement("div");
        credits.innerHTML = `
            The parsing of the md file for this documentation is powered by 
            <a href="https://marked.js.org/" target="_blank" rel="noopener noreferrer">marked.js</a>.
        `;
        container.appendChild(credits);

        return container;
    }

}
