import  ToDoApp from "../js/App.js";
import { APP_CONST } from "../js/const.js";

export class InfoPage {

    // constructor(app, content) {
    //     this.outerHTML = InfoPage.create(app, content);
    //     this.name = content[app.lang ?? APP_CONST.DEFAULT_SETTINGS.LANG].title;
    // }

    static create(app, content) {
        /**
         ** @param {ToDoApp} app - instance of the app
         ** @param {Object} content  - content of the Info page
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

}
