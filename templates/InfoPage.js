import  ToDoApp from "../js/App.js";
import { APP_CONST } from "../js/const.js";
import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";

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
        if (!readme) return 1; // error
        
        const markup = marked.parse(readme);
        
        const container = document.createElement("div");
        container.className = "info-page-container";
        
        container.innerHTML = markup;

        // add credits for marked.js at the end of the page
        const credits = document.createElement("div");
        credits.innerHTML = `
            The parsing of the md file for this documentation is powered by 
            <a href="https://marked.js.org/" target="_blank">marked.js</a>.
        `;
        container.appendChild(credits);

        return container;
    }

}
