import { APP_CONST, UI_CONST, SYMBOLS } from "./const.js";
import { ToDo } from "./ToDo.js";
import { Project } from "./Project.js";
import { ToDoDetail } from "../templates/ToDoDetail.js";
import { InputValidator } from "./InputValidator.js";
import ToDoApp from "./App.js";

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
                ${UI_CONST.APP_LOGO}
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
        pathContainer.innerHTML = `<span class="icon">${SYMBOLS.FOLDER}</span>
                                    <span class="path-node root-node" data-type="root">/</span>`;
        
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

    static renderToDoListView(app, todosArray, pathStr = "/root") {
        /**
         ** Renders the interactive ToDo list
         ** @param {ToDo[]} todosArray - The filtered + sorted array from app.js
         ** @param {string} pathStr - The current path (e. g. from buildPathObject)
         */
        const main = document.getElementById("app-main");
        
        // Render search bar + path view
        UI_Manager.renderSearchBar();
        UI_Manager.renderPath("#top-row", null, UI_Manager.navigateToNode);

        // check if old list in DOM - if yes, remove
        const oldList = main.querySelector(".todo-list");
        if (oldList) main.removeChild(oldList);

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
                    <!-- <span class="status-icon">${todo.status === 1 ? '✅' : '⭕'}</span> -->
                    <span class="todo-title">${todo.title}</span>
                </div>
                <div class="todo-card-actions">
                    <button class="card-btn complete-btn" title="Mark As Complete">${SYMBOLS.COMPLETE}</button>
                    <button class="card-btn copy-btn" title="Copy">${SYMBOLS.CD}</button>
                    <!-- <button class="card-btn template-btn" title="Save As Template">${SYMBOLS.TEMPLATE}</button> -->
                    <button class="card-btn delete-btn" title="Delete">${SYMBOLS.DELETE}</button>
                </div>
            `;

            // ### Bind event listeners ###
            
            // Open Detail View
            li.addEventListener("click", (e) => { app.UI_Manager.openToDo(todo.id, { mode: "show" }, app) });

            // Mark as completed
            li.querySelector(".complete-btn").addEventListener("click", (e) => { 
                e.stopPropagation(); 
                todo.markAsCompleted(); 
            });

            // Make a copy of the todo and open the copy for editing
            li.querySelector(".copy-btn").addEventListener("click", (e) => { 
                e.stopPropagation(); 
                const todoCopy = ToDo.copy(todo.id, app);
                app.UI_Manager.openToDo(todoCopy, { mode: "create" }, app);
            });

            // Save the ToDo as a Template --- TEMPLATE CLASS MUST FIRST BE IMPLEMENTED
            // li.querySelector(".template-btn").addEventListener("click", (e) => { 
            //     e.stopPropagation; 
            //     const newTemplate = Template.fromToDoID(todo.id);
            //     this.openTemplate(newTemplate);
            // });

            // Delete ToDo
            li.querySelector(".delete-btn").addEventListener("click", (e) => { 
                e.stopPropagation(); 
                ToDo.delete(todo.id); 
                UI_Manager.renderToDoListView(app, ToDo.getAllActiveToDos(), app.currentPath)
                return 0; 
            }, true);

            // Append to list
            ul.appendChild(li);
        });

        // append todo list to main section of DOM
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
         ** @param {ToDoApp} app - instance of the ToDoApp
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

        
        // Remove Add-Button + (if existing) ToDo list 
        // and old detailView from DOM
        // add detailView instead
        const main = document.querySelector("#app-main");
        const todoList = main.querySelector("#todo-list-ul");
        const addBtn = main.querySelector(".main-add-btn");
        const oldView = main.querySelector(".todo-detail-container");

        if (todoList) main.removeChild(todoList);
        if (addBtn) main.removeChild(addBtn);
        if (oldView) main.removeChild(oldView);
        main.appendChild(detailsView);

        // if new ToDo, set focus to title
        if (config.mode === "create") detailsView.querySelector("#todo-title-input").focus(); 
    }

    closeToDo() {
        console.log(`[DEV] closeToDo() was called`);

        // Close the ToDo detail view 
        // and re-render ToDo list + add button
        const main = document.querySelector("#app-main");
        const detailsView = main.querySelector(".todo-detail-container");

        main.removeChild(detailsView);
        UI_Manager.renderToDoListView(this.app, ToDo.getAllActiveToDos(), "/root");
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

        // if the user hasn't changed the title, 
        // take the placeholder as title
        if (title.value.trim().length < 1) title.value = title.placeholder;

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
