import { UI_CONST, SYMBOLS } from "../js/const.js";
import { ToDo } from "../js/ToDo.js";

export class ToDoCard {
    static create(todo, app, config = { mode: "normal" }) {
        /**
         * Creates an isolated ToDoCard for the list of search results
         * @param {ToDo} todo - The ToDo data object
         * @param {ToDoApp} app - Instance of the app
         */

        const li = document.createElement("li");
        li.setAttribute("data-todo-id", todo.id);
        li.className = "todo-item";
        li.setAttribute("title", UI_CONST.LABELS[app.lang].open);
        li.innerHTML = `
            <div class="todo-item-main">
                <button class="prio-btn-small prio-${todo.prio}" data-todo-id="${todo.id}" title="${UI_CONST.LABELS[app.lang].changePrio}">!</button>
                <span class="todo-title">${todo.title}</span>
            </div>
            <div class="todo-card-actions">
                <button class="card-btn complete-btn" title="${UI_CONST.LABELS[app.lang].markComplete}">${SYMBOLS.COMPLETE}</button>
                <button class="card-btn copy-btn" title="${UI_CONST.LABELS[app.lang].copy}">${SYMBOLS.CD}</button>
                <!-- <button class="card-btn template-btn" title="${UI_CONST.LABELS[app.lang].asTemplate}">${SYMBOLS.TEMPLATE}</button> -->
                <button class="card-btn delete-btn" title="${ config.mode === "trashBin" ? UI_CONST.LABELS[app.lang].delete : UI_CONST.LABELS[app.lang].moveToTrash}">${SYMBOLS.DELETE}</button>
            </div>
        `;

        // ### Bind event listeners ###

        // Change prio
        const prioBtn = li.querySelector(".prio-btn-small");
        prioBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            // toggle between prios:
            // 0 (low) - 1 (normal) - 2 (high) on click
            // if prio was high, reset to low

            const oldPrio = todo.prio; // used to remove prio-class (s. below)
            todo.prio++;
            if (todo.prio > 2) todo.prio = 0;
            // console.log("[DEV] Prio changed to: ", todo.prio);

            // update prio label:
            prioBtn?.classList.remove(`prio-${oldPrio}`);
            prioBtn.classList.add(`prio-${todo.prio}`);
        });
        
        // Open Detail View
        li.addEventListener("click", (e) => { app.UI_Manager.openToDo(todo.id, { mode: "show" }, app) });

        // Mark as completed
        li.querySelector(".complete-btn").addEventListener("click", (e) => { 
            e.stopPropagation(); 
            todo.markAsCompleted(); 
            const list = document.querySelector(".todo-list");
            const completed = document.querySelector(`li[data-todo-id="${todo.id}"]`);
            list.removeChild(completed);
            
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
            if (config.mode === "trashBin") {
                // if already in the trash bin, delete ToDo for good
                ToDo.delete(todo.id);
                // remove card from ToDoListView as visual feedback
                e.target.closest("li.todo-item").remove();
            } else {
                todo.moveToTrash();
            }
            app.UI_Manager.navigateToNode(app.currentPath.at(-1) ?? app.rootObject);
            return 0; 
        }, true);

        return li;
    }
}
