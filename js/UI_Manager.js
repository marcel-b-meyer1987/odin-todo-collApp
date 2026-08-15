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

    renderPath = (pathArr, onElementClick) => {
        /**
         ** @param {Array} pathArr - an array of ToDo or Project instances in hierarchical order
         ** @param {Function} onElementClick - a callback function triggered by click events
         ** ------------------------------------------------------
         ** Creates a clickable, unix-like path
         ** Example: / [Projekt] / [Parent Task] / [Current Task]
         */
        
        const parent = document.querySelector("#top-row"); // used to be passed in as param
        
        // Check if there is already a path view in the DOM
        // and, if yes, remove from DOM
        const oldPathView = parent.querySelector("#path-container");
        if (oldPathView) parent.removeChild(oldPathView); 
        
        // Create new path view
        const pathContainer = document.createElement("div");
        pathContainer.setAttribute("id", "path-container");      
        
        // Add folder symbol in beginning
        const folder = document.createElement("span");
        folder.className = "icon";
        folder.textContent = SYMBOLS.FOLDER;
        pathContainer.appendChild(folder);

        // Create root anchor
        const root = document.createElement("span");
        root.className = "path-node root-node parent-node";
        root.setAttribute("data-type", "root");
        root.textContent = UI_CONST.PATH_SEPARATOR;
        root.addEventListener("click", () => {
            this.app.currentPath = []; // set app path to root
            UI_Manager.renderToDoListView(this.app, ToDo.getAllActiveToDos().filter(todo => todo.parentID ===  null)); // display root level objects only
        })
        pathContainer.appendChild(root);
            
        
        // Loop over task hierarchy
        if (pathArr) {
            pathArr.forEach((node, index) => {

                // if not the first node (=directly preceded by root), add separator
                if (index > 0) {
                    const separator = document.createTextNode(UI_CONST.PATH_SEPARATOR);
                    pathContainer.appendChild(separator);
                }

                const span = document.createElement("span");
                span.innerText = node.name || node.title; // project uses .name, todo uses .title
                
                // Visual distinction (as ls in Terminal)
                if (index < (pathArr.length - 1)) {
                    span.className = "path-node parent-node"; // any node except last = parent
                    // span.style.fontWeight = "bold";
                    // span.style.color = "var(--accent-color)";
                } else {
                    span.className = "path-node todo-node";
                    // span.style.fontStyle = "italic";
                }

                // Enable click navigation for each PARENT element of the path
                if (span.classList.contains("parent-node")) {
                    span.addEventListener("click", () => {
                        onElementClick(node);
                    });
                }

                pathContainer.appendChild(span);
            });
        }

        parent.appendChild(pathContainer);
    }

    static pathToString(pathArr) {
        /**
         ** @param {Array} pathArr - The array of objects representing a path
         ** @return {String} pathStr - a flat string representation of the path
         */

        const separator = UI_CONST.PATH_SEPARATOR; // for instance " / "
        let pathStr = "";

        // Loop over task hierarchy
        if (pathArr) {
            pathArr.forEach((node, index) => {
                pathStr += separator;

                pathStr += node.name || node.title; // project uses .name, todo uses .title
            });
        } else {
            pathStr =  separator;
        }

        return pathStr.trim();
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

    static renderToDoListView(app, todosArray) {
        /**
         ** Renders the interactive ToDo list
         ** @param {ToDoApp} app - instance of the app
         ** @param {ToDo[]} todosArray - The filtered + sorted array from app.js
         */
        const main = document.getElementById("app-main");

        // close ToDoDetails (if open)
        const detailsView = main.querySelector(".todo-detail-container");
        if (detailsView) main.removeChild(detailsView);
        
        // Render search bar + path view
        UI_Manager.renderSearchBar();
        app.UI_Manager.renderPath(app.currentPath, app.UI_Manager.navigateToNode);

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
                // set current app path to parent object or root
                // app.currentPath = 
                //     todo.getParent()?.buildPathObject() ?? 
                //     Project.fromStorage(todo.project)?.buildPathObject() ??
                //     []; 
                ToDo.delete(todo.id); 
                // UI_Manager.renderToDoListView(app, ToDo.getAllActiveToDos());
                console.log(this);
                app.UI_Manager.navigateToNode(app.currentPath.at(-1) ?? app.rootObject);
                return 0; 
            }, true);

            // Append to list
            ul.appendChild(li);
        });

        // append todo list to main section of DOM
        main.appendChild(ul);
        UI_Manager.renderMainAddButon(app.UI_Manager.addToDo);
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

    getParentDir(currentDir) {
        /**
         ** @param {Array} currentDir - pathArray representing the current path
         ** @return {Array} parentDir - pathArray representing the upper-next directory 
         */

         console.log(`[DEV] UI_Manager.getParentDir() was called`);
         console.log(`[DEV] Old Path: ${UI_Manager.pathToString(currentDir)}`);

        const parent = currentDir.at(-2) // ?? currentDir.at(-1); // a ToDo instance
        let parentDir = [];
         console.log(`[DEV] Builduing path of parent object:`, parent);

         // check edge case: if object has no parent, parentDir must be reset to root => leave value at []
         if (!parent) {
            console.log(`[DEV] No parent found... default to root`)
            parentDir = [];   
         } else {
            parentDir = parent.buildPathObject();
         }

         console.log(`[DEV] New Path: ${UI_Manager.pathToString(parentDir)}`);

         return parentDir;
    }

    navigateToNode = (node) => {
        /**
         ** @param {Object} node - The object (Project/ToDo) the user wants to view 
         */
        
        let type = undefined;
        let ref = undefined;
        let obj = null;
        let path = null;
        let children = null;
        
        // establish which type of node was passed (ToDo or Project)
        if (node instanceof ToDo) type = "ToDo";
        if (node instanceof Project) type = "Project";
        console.log(`[DEV] navigateToNode() called on ${type} node:`, node);
        
        // Extract reference from node (id if ToDo / name if Project)
        // check if node has children
        // get data object from storage 
        // build path object + adjust app.currentPath to the same
        // render path + update path view
        
        // const ref = type === "ToDo" ? node.id : node.name;
        // const children = type === "ToDo" ? ToDo.getAllChildren(ref) : Project.getAllChildren(ref);
        // const obj = type === "ToDo" ? ToDo.fromStorage(ref) : Project.fromStorage(ref);

        switch(type) {
            case "ToDo":
                ref = node.id;
                children = ToDo.getAllChildren(ref);
                obj = ToDo.fromStorage(ref);
                path = obj.buildPathObject();
                break;

            case "Project":
                ref = node.name;
                children = Project.getAllChildren(ref);
                obj = Project.fromStorage(ref);
                path = obj.buildPathObject();
                break;

            default:
                console.log(`[DEV] Undefined object type detected: `, node);
                console.log(`[DEV] Fall back to app.rootObject: `, this.app.rootObject);
                children = this.app.loadAllToDos().filter(todo => todo.parentID === null); // root level todos only
                obj = this.app.rootObject;
                path = [];
                break;
        }

        this.app.currentPath = path;
        this.renderPath(path, this.navigateToNode);

        // if data object has children: display todo list of the children
        if (children.length > 0 || ((type !== "Todo") && (type !== "Project"))) {
            UI_Manager.renderToDoListView(
                this.app, 
                children);
            return 0;
        }

        // if data object has no children: open detail view of the object
        if (children.length < 1) {
            switch(type) {
                case "ToDo":
                    this.openToDo(ref, { mode: "show" }, this.app);
                    break;
                case "Project":
                    this.openProject(ref, { mode: "show" }, this.app);
                    break;
                default:
                    UI_Manager.renderToDoListView(this.app, children);
                    break;
            }
            return 0;
        }
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
            onPrioChange : () => {
                // toggle between prios:
                // 0 (low) - 1 (normal) - 2 (high) on click
                // if prio was high, reset to low

                const oldPrio = todo.prio; // used to remove prio-class (s. below)
                todo.prio++;
                if (todo.prio > 2) todo.prio = 0;
                // console.log("[DEV] Prio changed to: ", todo.prio);

                // update prio label:
                const label = document.querySelector(".prio-label");
                label?.classList.remove(`prio-${oldPrio}`);
                label?.classList.add(`prio-${todo.prio}`);
            },
            onViewChecklist : () => {
                this.app.currentPath = todo.buildPathObject();
                // UI_Manager.renderPath("#top-row", this.app.currentPath, this.navigateToNode);
                UI_Manager.
                    renderToDoListView(
                        this.app, 
                        todo.checklist.map(id => ToDo.fromStorage(id))?.filter(Boolean));
            }, 
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

        // update app path to current todo's path and re-render
        this.app.currentPath = todo.buildPathObject();
        this.renderPath(this.app.currentPath, this.navigateToNode);

        // if new ToDo, set focus to title
        if (config.mode === "create") detailsView.querySelector("#todo-title-input").focus(); 
    }

    closeToDo() {
        console.log(`[DEV] closeToDo() was called`);

        // Close the ToDo detail view 
        // and re-render ToDo list + add button
        const main = document.querySelector("#app-main");
        const detailsView = main.querySelector(".todo-detail-container");

        if (detailsView) main.removeChild(detailsView);
        this.app.currentPath = this.getParentDir(this.app.currentPath);
        this.navigateToNode(this.app.currentPath.at(-1) ?? this.app.rootObject);
        // this.renderPath(this.app.currentPath);
        // UI_Manager.renderToDoListView(this.app, this.app.currentPath);
    }

    openProject(projectName, config = { mode: "show" }, app) {
        /**
         ** @param {string} projectName - The name of the Project to show 
         ** @param {object} config - determines additional config parameters - at least, if Project is being opened for creation OR showing only
         ** @param {ToDoApp} app - instance of the ToDoApp
         */

        // Render the full detail view for Projects, fill it with the data of the Project
        // track + save changes applied by the user (if any)
        console.log("[DEV] openProject() triggered");
    }

    addToDo = (e) => {
        // create a new ToDo in the app, 
        // then open its detail view for editing + saving

        console.log("[DEV] UI_Manager.addToDo() triggered");
        const newToDoID = this.app.addToDo({ title: "New ToDo"});

        // if ToDo is being created as a child element, set parent
        const pathArr = [...this.app.currentPath];
        const [parent] = pathArr.slice(-1); // parent = last node of path
        if (parent) {
            ToDo.fromStorage(newToDoID).setParent(parent.id);
            console.log(`[DEV] Set parent of ${newToDoID} to ${parent.id}.`);
        }

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
            todo.notes = notes.value;
            todo.setDeadline(dueDate);
            todo.categories = catsArr;
            todo.saveToStorage();
            // possibly need to get up one directory at this point
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
