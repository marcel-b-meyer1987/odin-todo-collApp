import { APP_CONST, UI_CONST } from "./const.js";
import { ToDo } from "./ToDo.js";
import { Project } from "./Project.js";
import { ToDoDetail } from "../templates/ToDoDetail.js";
import { InputValidator } from "./InputValidator.js";

export class UI_Manager {

    static #root = document.querySelector("#app-root");

    constructor(app) {
        this.app = app;
        this.validate = new InputValidator();
        this.errors = [];
    }

    // ##########################################################
    // ### INITIAL SETUP + STANDARD RENDERING + MENU TOGGLING ###
    // ##########################################################

    static initLayout() {
        /**
         ** Initialize base layout (Header + Main + Footer)
         */
        UI_Manager.#root.innerHTML = `
            <header class="app-header">
                ${APP_CONST.APP_LOGO}
                <div id="header-middle-column"></div>    
                <button class="menu-toggle" id="menu-btn">
                    <span class="bar"></span>
                    <span class="bar"></span>
                    <span class="bar"></span>
                </button>
            </header>
            
            <!-- Dynamischer Hauptinhalt -->
            <div id="top-row"></div>
            <main id="app-main"></main>

            <footer class="app-footer">
                <p>--- The Footer comes here ---</p>
            </footer>
        `;

        // bind event listener for the Hamburger menu
        document.getElementById("menu-btn").addEventListener("click", () => {
            UI_Manager.toggleMenu();
        });
    }

    static renderSearchBar(parentElementStr = "#header-middle-column") {
        /**
         ** @param parentElement - The query string for the DOM element to which the component should be attached
         **                         (defaults to the <main> element)
         */

        // Check if there is already a search bar in th DOM
        // and, if yes, remove from DOM
        const parent = document.querySelector(parentElementStr);
        const oldSearchBar = parent.querySelector(".search-filter-container");
        if (oldSearchBar) parent.removeChild(oldSearchBar);

        const placeholder = UI_CONST.SEARCHBAR_PLACEHOLDER ?? "Search & Filter";

        const searchBar = document.createElement("div");
        searchBar.classList.add("search-filter-container");

        const input = document.createElement("input");
        input.setAttribute("type", "text");
        input.setAttribute("id", "search-input");
        input.setAttribute("placeholder", placeholder);
        
        const btn = document.createElement("button");
        btn.classList.add("filter-btn");
        btn.innerText = "ᯤ";
        
        searchBar.appendChild(input);
        searchBar.appendChild(btn);
        parent.appendChild(searchBar);
    }

    static renderPath(parentElementStr = "#top-row", pathObject, onElementClick) {
        /**
         ** Creates a clickable, unix-like path (sticky)
         ** Example: / [Projekt] / [Parent Task] / [Current Task]
         */
        
        const parent = document.querySelector(parentElementStr);
        
        // Check if there is already a path view in the DOM
        // and, if yes, remove from DOM
        const oldPathView = parent.querySelector("#path-container");
        if (oldPathView) parent.removeChild(oldPathView); 
        
        // Create new path view
        const pathContainer = document.createElement("div");
        pathContainer.setAttribute("id", "path-container");      
        
        // Create root anchor
        pathContainer.innerHTML = `<span class="path-node root-node" data-type="root">/</span>`;
        
        // Loop over task hierarchy
        if (pathObject && pathObject.hierarchy) {
            pathObject.hierarchy.forEach((node, index) => {
                const separator = document.createTextNode(" / ");
                pathContainer.appendChild(separator);

                const span = document.createElement("span");
                span.innerText = node.name || node.title; // project uses .name, todo uses .title
                
                // Visual distinction (as ls in Terminal)
                if (index === 0) {
                    span.className = "path-node project-node"; // 1st entry after root = Project
                    // span.style.fontWeight = "bold";
                    // span.style.color = "var(--accent-color)";
                } else {
                    span.className = "path-node todo-node";
                    // span.style.fontStyle = "italic";
                }

                // Enable click navigation for each path element
                span.addEventListener("click", () => {
                    onElementClick(node);
                });

                pathContainer.appendChild(span);
            });
        }

        parent.appendChild(pathContainer);
    }

    static toggleMenu() {
        console.log("Hauptmenü geöffnet/geschlossen");
        // Hier wird später das Hauptmenü eingeblendet
    }
    
    static renderWelcomeView() {
        /**
         ** Renders the welcome view (/root) l
         */
        const main = document.getElementById("app-main");
        main.innerHTML = `
            <div class="view-path">/root</div>
            <div class="welcome-box">
                <h2>Welcome to ToDo CollApp -</h2>
                <p>the simple app for organizing todos with your team mates.</p>
                <p><strong>Click on the menu icon to see possible actions.</strong></p>
            </div>
        `;
    }

    static renderToDoListView(todosArray, pathStr = "/root") {
        /**
         ** Renders the interactive ToDo list
         ** @param {ToDo[]} todosArray - The filtered + sorted array from app.js
         ** @param {string} pathStr - The current path (e. g. from buildPathObject)
         */
        const main = document.getElementById("app-main");
        
        // Render search bar + path view
        UI_Manager.renderSearchBar();
        UI_Manager.renderPath("#top-row", null, UI_Manager.navigateToNode);

        // create todo list
        // <ul class="todo-list" id="todo-list-ul"></ul>
        const ul = document.createElement("ul");
        ul.setAttribute("id", "todo-list-ul");
        ul.className = "todo-list";

        // render ToDos + append to list
        todosArray.forEach(todo => {
            const li = document.createElement("li");
            li.setAttribute("data-todo-id", todo.id);
            li.className = `todo-item ${todo.status === 1 ? 'completed' : ''}`;
            li.innerHTML = `
                <div class="todo-item-main">
                    <span class="status-icon">${todo.status === 1 ? '✅' : '⭕'}</span>
                    <span class="todo-title">${todo.title}</span>
                </div>
                <!-- Context menu (per default hidden via CSS) -->
                <div class="todo-context-menu" id="context-${todo.id}" style="display: none;">
                    <button class="ctx-btn delete" data-id="${todo.id}">Delete (Trash Bin)</button>
                    <button class="ctx-btn complete" data-id="${todo.id}">Mark as complete</button>
                    <button class="ctx-btn template" data-id="${todo.id}">Save as template</button>
                </div>
            `;

            // Event Listener for opening context menu
            li.querySelector(".todo-item-main").addEventListener("click", () => {
                UI_Manager.toggleContextMenu(todo.id);
            });

            // Event-Listener for the buttons of the context menu
            li.querySelector(".ctx-btn.complete").addEventListener("click", (e) => {
                e.stopPropagation(); // Verhindert das Schließen des Menüs
                todo.markAsCompleted(); // Deine Logik-Methode!
                li.classList.add("completed");
                li.querySelector(".status-icon").textContent = "✅";
                UI_Manager.toggleContextMenu(todo.id); // Schließen
            });

            ul.appendChild(li);
        });

        // append todo list to main section
        main.appendChild(ul);
    }

    static toggleContextMenu(todoID) {
        const menu = document.getElementById(`context-${todoID}`);
        if (menu) {
            menu.style.display = menu.style.display === "none" ? "block" : "none";
        }
    }

    static renderMenu(menuItemsArray = UI_CONST.MENU_ITEMS, currentLang = APP_CONST.DEFAULT_SETTINGS.LANG, onActionTriggered) {
        const menuOverlay = document.createElement("div");
        menuOverlay.className = "menu-overlay";
        
        const ul = document.createElement("ul");
        
        menuItemsArray.forEach(item => {
            const li = document.createElement("li");
            const btn = document.createElement("button");
            
            // Get the correct display name from the multilingual data object (e. g. disp_name.en)
            btn.innerText = item.disp_name[currentLang] || item.disp_name[APP_CONST.DEFAULT_SETTINGS.LANG];
            btn.className = `menu-item-btn action-${item.name}`;
            
            btn.addEventListener("click", () => {
                onActionTriggered(item.name); // returns "settings", "projects" etc.
            });
            
            li.appendChild(btn);
            ul.appendChild(li);
        });
        
        menuOverlay.appendChild(ul);
        return menuOverlay;
    }

    static renderContextMenu(dataObj, menuItemsArray, currentLang = APP_CONST.DEFAULT_SETTINGS.LANG, onActionTriggered) {
        const menu = document.createElement("div");
        const id = dataObj.id ?? dataObj.name; // use id as identifier for ToDos and TeamMembers, name for Projects
        menu.setAttribute("id", `context-${id}`);
        menu.classList.add("todo-context-menu");
        menu.classList.add("context-menu-hidden");
        
        menuItemsArray.forEach(item => {
            // Get the correct display name from the multilingual menuItemsArray (e. g. disp_name.en)
            const disp_name = item.disp_name[currentLang] || item.disp_name[APP_CONST.DEFAULT_SETTINGS.LANG];
            
            const btn = document.createElement("button");
            btn.outerHTML = `<button class="ctx-btn ${item.name}" data-id="${dataObj.id}">${disp_name}</button>`;
            
            
            btn.addEventListener("click", () => {
                onActionTriggered(item.name); // calls the callbackFn onActionTriggered with "settings", "projects" etc.
            });
            
            menu.appendChild(btn);
        });
        
        return menu;
    }
   
    static renderMainAddButon(callbackFn = app.UI_Manager.addToDo) {

        // <!-- Display Add-Button -->
        // <button class="main-add-btn">+</button>
        const btn = document.createElement("button");
        btn.classList.add("main-add-btn");
        btn.innerText = "+";
        btn.addEventListener("click", callbackFn);
        
        const main = document.querySelector("#app-main");
        main.appendChild(btn);
    }


    // ############################################
    // ### DIALOG VIEWING + INTERACTION METHODS ###
    // ############################################


    navigateToNode(node) {
        /**
         ** @param {Node} - The display node in the path which refers to the object (Project/ToDo) the user wants to view 
         */
        console.log(`[DEV] navigateToNode() called on node:`, node);

        // Extract reference from node
        // get data object from storage 
        // build path object
        // render path + update path view 
        // if data object has children: display todo list of the children
        // if data object has no children: open detail view of the object
    }

    openToDo(todoID, config = { mode: "show" }, app) {
        /**
         ** @param {string} todoID - The ID of the ToDo to show 
         ** @param {object} config - determines additional config parameters - at least, if todo is being opened for creation OR showing only
         */

        // Render the full detail view for ToDos, fill it with the data of the ToDo
        // track + save changes applied by the user (if any)
        console.log("[DEV] openToDo() triggered");

        
        const todo = ToDo.fromStorage(todoID);
        
        // define callback functions for detail view
        const callbacks = {
            onSave : () => {
                // validate + save
                this.saveToDo(todoID);
            },
            onAbort : () => {
                // if the todo was just created, delete it,
                // as it was automatically saved upon creation, 
                // which would otherwise lead to orphaned data
                if (config && config.mode === "create") ToDo.delete(todoID);
                this.closeToDo();
            }
        }
        
        const detailsView = ToDoDetail.create(app, todo, this.app.lang, callbacks);
        
        // Remove Add-Button + (if existing) ToDo list from DOM
        // add detailView instead
        const main = document.querySelector("#app-main");
        const todoList = main.querySelector("#todo-list-ul");
        const addBtn = main.querySelector(".main-add-btn");

        if (todoList) main.removeChild(todoList);
        if (addBtn) main.removeChild(addBtn);
        main.appendChild(detailsView);
    }

    closeToDo() {
        console.log(`[DEV] closeToDo() was called`);

        // Close the ToDo detail view 
        // and re-render ToDo list + add button
        const main = document.querySelector("#app-main");
        const detailsView = main.querySelector(".todo-detail-container");

        main.removeChild(detailsView);
        UI_Manager.renderToDoListView(ToDo.getAllActiveToDos(), "/root");
        UI_Manager.renderMainAddButon(this.app.UI_Manager.addToDo);
    }

    addToDo = () => {
        // create a new ToDo in the app, 
        // then open its detail view for editing + saving

        console.log("[DEV] UI_Manager.addToDo() triggered");
        const newToDoID = this.app.addToDo({ title: "New ToDo"});
        console.log(`[DEV] Opening new ToDo ID (${newToDoID}) in UI_Manager.openToDo()`);
        this.openToDo(newToDoID, { mode: "create" }, this.app);
    }

    saveToDo(todoID) {
        // loop over all inputs of the open ToDo:
        // if valid, save the changes
        // if not, display error message (in footer)
        const title = document.querySelector(".todo-title");
        const notes = document.querySelector("#todo-notes");
        const dueDate = new Date(document.querySelector("#due-date").value);
        let catsArr = document.querySelector("#categories-display").value.split(",").map(el => el.trim());

        // validate title
        console.log("[DEV] title:", title);
        if(this.validate.isEmpty(title)) this.handleError(UI_CONST.ERRORS.EMPTY_TITLE);
        if(this.validate.exceedsMaxLength(title, APP_CONST.DEFAULT_SETTINGS.MAX_TITLE_LENGTH)) this.handleError(UI_CONST.ERRORS.LONG_TITLE);

        // validate notes
        if(this.validate.exceedsMaxLength(notes, APP_CONST.DEFAULT_SETTINGS.MAX_NOTES_LENGTH)) this.handleError(UI_CONST.ERRORS.LONG_NOTES);

        // validate dueDate
        console.log("[DEV] dueDate:", dueDate);
        if(this.validate.dateIsPast(dueDate)) this.handleError(UI_CONST.ERRORS.PAST_DATE);

        // handle categories
        // if several cats, remove "Uncategorized"
        if (catsArr.length > 1) {
            catsArr = catsArr.filter(cat => {
                return (cat !== "uncategorized") && (cat !== "Uncategorized");
            });
        }

        // make sure "Uncategorized" is still in there, if nothing else
        if (catsArr.length < 1) {
            catsArr.push("Uncategorized");
        }
        console.log("[DEV] catsArr:", catsArr);

        // if all ok, take over values and save ToDo
        if(this.errors.length < 1) {
            const todo = ToDo.fromStorage(todoID);
            todo.title = title.value.trim();
            todo.setDeadline(dueDate);
            todo.categories = catsArr;
            todo.saveToStorage();
            this.closeToDo();
            return 0; // success
        } else {
            return 1; // error
        }
    }

    handleError(errCode) {
        this.errors.push(errCode);
        this.showErrorMsg(this.errors);
    }

    showErrorMsg(errors) {
        // TEMPORARY ONLY - MUST BE REPLACED FOR PRODUCTION
        console.warn("[DEV] UI_Manager.errors:");
        console.table(errors);
    }

}

// DIETER
