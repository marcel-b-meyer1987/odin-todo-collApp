import { APP_CONST, UI_CONST, SYMBOLS, TODO_STATUS } from "./const.js";
import { ToDo } from "./ToDo.js";
import { Project } from "./Project.js";
import { InputValidator } from "./InputValidator.js";
import { QUOTES } from "../quotes.js";
import ToDoApp from "./App.js";
import { ToDoCard } from "../templates/ToDoCard.js";
import { ToDoDetail } from "../templates/ToDoDetail.js";
import { MainMenu } from "../templates/html/MainMenu.js";
import { createElement } from "react";
import { InfoPage } from "../templates/InfoPage.js";
import { about } from "../content/about.js";


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

    static initLayout(app) {
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
            UI_Manager.openMenu(app.lang, {
                onMenuAction: (actionName) => {
                    UI_Manager.handleMenuSelection(actionName, app);
                },
                onLogoutTriggered: () => {
                    console.log("Benutzer abgemeldet. Zurück zum Login.");
                    // Setzt die App zurück und zeigt wieder den Login-Bildschirm
                    this.checkUserAuth(); 
                }
            });
        });
    }

    static handleMenuSelection(actionName, app){
                    console.log(`[DEV] Action was called: ${actionName}`);
                    
                    // NEEDS TO BE FIXED:
                    // const menuObj = UI_CONST.MENU_ITEMS.reduce((accumulator, currentValue) => {
                    //     accumulator[currentValue.name] = currentValue.disp_name;
                    // }, {});

                    // Routing based on the passed-in action
                    switch(actionName) {
                        case "todos":
                            // Navigate to root node & display all root level objects
                            app.currentPath = []; // root
                            app.UI_Manager.renderPath(app.currentPath, app.UI_Manager.navigateToNode);
                            UI_Manager.renderToDoListView(app, ToDo.getAllActiveToDos().filter(todo => todo.parentID === null)); // ONLY display root level todos
                            break;

                        case "categories":
                            // Show an alphabetically sorted list of all categories
                            break;

                        case "projects":
                            // Show a List View of all projects
                            break;

                        case "team":
                            // Show a list view of all team members
                            break;

                        case "settings":
                            // Show the settings dialog
                            break;

                        case "about":
                            app.UI_Manager.navigateToNode({ name: "About" });
                            UI_Manager.showInfoPage(about, app);                 
                            break;

                        case "doc":
                            // Show README.md, parsed as HTML
                            app.UI_Manager.navigateToNode({ name: "Documentation" });
                            UI_Manager.showInfoPage("README.md", app, true);
                            break;

                        default:
                            console.log(`[DEV] Action ${actionName} unknown.`);
                            break;

                    }
    }

    static openMenu(userLang, callbacks) {
        /**
         * Opens th data-driven main menu and animates slide-in
         * @param {String} userLang - language of the current user
         * @param {Object} callbacks - object containing the needed callback functions as methods
         */

        // In case a menu is already opened, close it to prevent duplicates
        UI_Manager.closeMenu();

        const menuNode = MainMenu.create(userLang, {
            onAction: (actionName) => {
                UI_Manager.closeMenu();
                callbacks.onMenuAction?.(actionName);
            },
            onClose: () => {
                UI_Manager.closeMenu();
            },
            onLogout: () => {
                UI_Manager.closeMenu();
                callbacks.onLogoutTriggered?.();
            }
        });

        // Briefly hide the inner panel for animation 
        const panel = menuNode.querySelector(".menu-content-panel");
        panel.style.transform = "translateX(100%)";
        panel.style.transition = "transform 0.3s ease-out";

        document.body.appendChild(menuNode);

        // Apply central animation logic 
        // pass in an anonymous function which will be called on the panel
        UI_Manager.animate(panel, [
            function() {
                this.style.transform = "translateX(0%)";
            }
        ], 10); // Minimal delay, so the browser can register the transition

    }

    static closeMenu() {
        /**
         * Close the main menu
         */
        const existingMenu = document.querySelector(".main-menu-overlay");
        if (existingMenu) {
            const panel = existingMenu.querySelector(".menu-content-panel");
            UI_Manager.animate(panel, [
            function() {
                this.style.transition = "transform 0.3s ease-out";
                this.style.transform = "translateX(100%)";
            }], 0);
            
            setTimeout(() => { existingMenu.remove() }, 300);
        }
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
            
        
        // Loop over path hierarchy
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

                if (node instanceof ToDo || node instanceof Project) {
                    // Enable click navigation for each PARENT element of the path
                    // and open-on-click for the last element (=child)
                    if (span.classList.contains("parent-node")) {
                        span.addEventListener("click", () => {
                            onElementClick(node);
                        });
                    } else {
                        span.addEventListener("click", () => {
                            this.openToDo(node.id, { mode: "show" }, this.app);
                        });
                    }
                }

                pathContainer.appendChild(span);
            });
        }

        // If not in root dir: Add button to navigate to upper-next path directory (like "cd .." in unix shell)
        if (pathArr.length > 0) {
            const cdUp = document.createElement("span");
            cdUp.className = "icon cd-up";
            cdUp.innerText = SYMBOLS.UP;
            cdUp.setAttribute("title", "Go To Parent");
            cdUp.addEventListener("click", (e) => {
                e.stopPropagation();
                const main = document.querySelector("#app-main");
                const detailsView = main.querySelector(".todo-detail-container");

                if (detailsView) main.removeChild(detailsView);
                this.app.currentPath = this.getParentDir(this.app.currentPath);
                this.navigateToNode(this.app.currentPath.at(-1) ?? this.app.rootObject);
            })
            pathContainer.appendChild(cdUp);

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

    renderQuote() {
        const footer = document.querySelector(".app-footer");
        const quotes = QUOTES[this.app.lang] ?? QUOTES[APP_CONST.DEFAULT_SETTINGS.LANG];
        const quote = quotes[Math.floor(Math.random() * quotes.length)];
        if (!quote) return 1;
        footer.innerHTML = `
            <div>
                <p class="quote">"${quote.quote}"</p>
            </div>
            <div>
                <p class="author">- ${quote.author}</p>
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
        
        // check if old list in DOM - if yes, remove
        const oldList = main.querySelector(".todo-list");
        if (oldList) main.removeChild(oldList);

        // close InfoPage, if any
        const info = main.querySelector(".info-page-container");
        if (info) main.removeChild(info);

        // Render search bar + path view
        UI_Manager.renderSearchBar();
        app.UI_Manager.renderPath(app.currentPath, app.UI_Manager.navigateToNode);


        // create todo list
        // <ul class="todo-list" id="todo-list-ul"></ul>
        const ul = document.createElement("ul");
        ul.setAttribute("id", "todo-list-ul");
        ul.className = "todo-list";

        // render ToDos using template + append to list
        todosArray.forEach(todo => {
            // exclude all todos which are not active (="PENDING")
            if (todo.status === TODO_STATUS.PENDING) {
                const li = ToDoCard.create(todo, app);
                ul.appendChild(li);
            }
        });

        // append todo list to main section of DOM
        main.appendChild(ul);
        UI_Manager.renderMainAddButon(app, app.UI_Manager.addToDo);
    }

    // static toggleContextMenu(todoID) {
    //     const menu = document.getElementById(`context-${todoID}`);
    //     if (menu) {
    //         menu.style.display = menu.style.display === "none" ? "block" : "none";
    //     }
    // }

    // static renderContextMenu(dataObj, menuItemsArray, currentLang = APP_CONST.DEFAULT_SETTINGS.LANG, onActionTriggered) {
    //     const menu = document.createElement("div");
    //     const id = dataObj.id ?? dataObj.name; // use id as identifier for ToDos and TeamMembers, name for Projects
    //     menu.setAttribute("id", `context-${id}`);
    //     menu.classList.add("todo-context-menu");
    //     menu.classList.add("context-menu-hidden");
        
    //     menuItemsArray.forEach(item => {
    //         // Get the correct display name from the multilingual menuItemsArray (e. g. disp_name.en)
    //         const disp_name = item.disp_name[currentLang] || item.disp_name[APP_CONST.DEFAULT_SETTINGS.LANG];
            
    //         const btn = document.createElement("button");
    //         btn.outerHTML = `<button class="ctx-btn ${item.name}" data-id="${dataObj.id}">${disp_name}</button>`;
            
            
    //         btn.addEventListener("click", () => {
    //             onActionTriggered(item.name); // calls the callbackFn onActionTriggered with "settings", "projects" etc.
    //         });
            
    //         menu.appendChild(btn);
    //     });
        
    //     return menu;
    // }
   
    static renderMainAddButon(app, callbackFn = app.UI_Manager.addToDo) {

        // <!-- Display Add-Button -->
        // <button class="main-add-btn">+</button>

        // if no add button existing, add one
        const main = document.querySelector("#app-main");
        let btn = document.querySelector("main-add-btn");
        if (!btn) {
            btn = document.createElement("button");
            btn.classList.add("main-add-btn");
            btn.setAttribute("title", UI_CONST.LABELS[app.lang].add);
            btn.innerText = "+";
            btn.addEventListener("click", callbackFn);   
            
        } 

        main.appendChild(btn);

        // Add event listener for keydown
        UI_Manager.registerKeydownHandler({ onNew: callbackFn }, { mode: "list" });
        window.addEventListener("keydown", UI_Manager.activeKeydownHandler, { capture: false });
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
        if (node instanceof Object && (!Array.isArray(node))) type = "InfoPage";
        console.log(`[DEV] navigateToNode() called on ${type} node:`, node);
        
        // Extract reference from node (id if ToDo / name if Project or InfoPage)
        // check if node has children
        // get data object from storage 
        // build path object + adjust app.currentPath to the same
        // render path + update path view

        switch(type) {
            case "ToDo":
                children = ToDo.getAllChildren(node.id);
                path = node.buildPathObject();
                break;

            case "Project":
                children = Project.getAllChildren(node.name);
                path = node.buildPathObject();
                break;

            case "InfoPage":
                obj = this.app.rootObject;
                path = [node];
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
        if (children && children.length > 0) {
            UI_Manager.renderToDoListView(
                this.app, 
                children);
            return 0;
        }

        // if data object has no children: open detail view of the object
        if (children && children.length < 1) {
            switch(type) {
                case "ToDo":
                    this.openToDo(ref, { mode: "show" }, this.app);
                    break;
                case "Project":
                    this.openProject(ref, { mode: "show" }, this.app);
                    break;
                case "InfoPage":
                    // UI_Manager.showInfoPage(about, this.app);
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

        
        // Remove Add-Button 
        // + (if existing) ToDo list 
        // + (if existing) InfoPage 
        // and old detailView from DOM
        // add detailView instead
        const main = document.querySelector("#app-main");
        const todoList = main.querySelector("#todo-list-ul");
        const info = main.querySelector(".info-page-container");
        const addBtn = main.querySelector(".main-add-btn");
        const oldView = main.querySelector(".todo-detail-container");

        if (todoList) main.removeChild(todoList);
        if (info) main.removeChild(info);
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

        // remove details view from DOM 
        if (detailsView) main.removeChild(detailsView);

        // remove event listeners for keyboard shortcuts
        window.removeEventListener("keydown", UI_Manager.activeKeydownHandler, { capture: false });

        // change path to the parent dir + show the list view of its contents
        this.app.currentPath = this.getParentDir(this.app.currentPath);
        this.navigateToNode(this.app.currentPath.at(-1) ?? this.app.rootObject);
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


    static async showInfoPage(content, app, md = false) {
        /**
         ** @param {Object} content - an object for the content, divided into lang versions [en] etc.
         ** @param {ToDoApp} app - instance of the app
         ** @param {Boolean} md - flag indicating of the content is read from a markdown file
         ** @returns {Number} - 0 = success / 1 = error
         */

        if ((!content) || (!app)) return 1;

        // Clear content of main section
        const main = document.querySelector("#app-main");
        main.innerHTML = "";

        // Create a container for the info page and append it
        // if content is from .md file, use the method to pull it in
        const container = md === false ? InfoPage.create(app, content) : await InfoPage.fromMarkdown(app, content);
        main.appendChild(container);
        return 0; 
    }


    // ############################
    // ### UI ANIMATION METHODS ###
    // ############################
    
    static animate(element, animationsArr, delay = 0) {
        /**
         ** @param {HTMLElement} element - the HTML element which should be animated
         ** @param {Array} animationsArr - array of custom animation functions which will be called one after another on the element
         ** @param {Number} delay - delay before animation in ms, defaults to 0
         */
        if (!element) return 1;
        if (!animationsArr || animationsArr.length < 1) return 1;

        setTimeout(() => {
            animationsArr.forEach(animation => animation.call(element))
        }, delay);
    }


    // ######################
    // ### EVENT HANDLERS ###
    // ######################

    static activeKeydownHandler = null;

    static registerKeydownHandler(callbacks, config = { mode: "details" }) {
        // If old handler exists, delete it
        if (UI_Manager.activeKeydownHandler) window.removeEventListener("keydown", UI_Manager.activeKeydownHandler);

        // store event handler function in variable reference
        switch (config.mode) {
            case "details":
                UI_Manager.activeKeydownHandler = (e) => UI_Manager.handleToDoDetailsKeydown(e, callbacks);
                break;
            
            case "list":
                UI_Manager.activeKeydownHandler = (e) => UI_Manager.handleListViewKeydown(e, callbacks);
                break;

            default:
                return 1; // error
        }
    }

    static handleToDoDetailsKeydown = (e, callbacks) => {
        // only do anything special if the Alt key is held down
        if (e.altKey) {
            switch (e.key) {    
                case "s":
                    callbacks.onSave?.();
                    break;
                case "a":
                    callbacks.onAbort?.();
                    break;
                case "p":
                    callbacks.onPrioChange?.();
                    break;
            }
        }
    }

    static handleListViewKeydown = (e, callbacks) => {
        // only do anything special if the Alt key is held down
        if (e.altKey) {
            switch (e.key) {    
                case "n":
                    callbacks.onNew?.();
                    break;
            }
        }
    }

}
