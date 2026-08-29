import { TODO_STATUS, TODO_PRIO, APP_CONST, UI_CONST, SYMBOLS } from "../js/const.js";
import { DiaryEntry } from "../js//DiaryEntry.js";
import { UI_Manager } from "../js/UI_Manager.js";

export class ToDoDetail {
    
    static create(app, todo, userLang = APP_CONST.DEFAULT_SETTINGS.LANG, callbacks) {
        /**
         ** Creates the DOM Element for the detail view of a ToDo
         ** @param {ToDo} todo - The ToDo Object
         ** @param {string} userLang - User language ('de' or 'en'), default = app default
         ** @param {Object} callbacks - click actions (e. g. Back, Edit)
         */
    
        const container = document.createElement("div");
        container.className = "todo-detail-container";

        // Localisation for the labels
        const labels = UI_CONST.LABELS[userLang] || UI_CONST.LABELS[APP_CONST.DEFAULT_SETTINGS.LANG];

        // helper variables
        const now = new Date();
        let tempCats = todo.categories;
        let catStr = "Uncategorized";
        if (tempCats.length > 0) {
            catStr = tempCats.length > 1 ? tempCats.join(", ") : tempCats[0];
        }
        const team = app.teamMembers;

        console.log(`[DEV] catStr: `, catStr);

        const categories = {
            activateEdit: () => {
                // change the actual value of the categories-display to the placeholder
                // append a comma and space + set the caret to the end
                const input = container.querySelector("#categories-display");
                console.log("[DEV] activate editing categories");
                if (tempCats.length > 1) input.placeholder = tempCats.join(", ");
                input.value = tempCats.length > 0 ? input.placeholder + ", " : "";
                input.focus();
            },

            parseAndUpdate: () => {
                // parse the value of the categories-display into an array of strings,
                // separated by commas + trimmed
                // store the array in the tempCats helper variable
                // onSave: store the array (=the content of the tempCats helper variable) in the todo.categories property
                console.log("[DEV] parse and update categories");
                const input = container.querySelector("#categories-display");

                // strip off trailing commas (if any)
                if(input.value.substr(-1,1) === ",") input.value = input.value.substr(0,input.value.length-1);
                if(input.value.substr(-2,1) === ",") input.value = input.value.substr(0,input.value.length-2);

                tempCats = input.value !== "" ? input.value.split(",").map((s) => s.trim()) : ["Uncategorized"];
                input.placeholder = input.value !== "" ? input.value.split(",").map((s) => s.trim()) : ["Uncategorized"];
                console.log(`[DEV] Parsed categories:`, tempCats);
            }
        };

        // create team member dropdown + option tags for all team members + these generic ones:
        // <option value="">${labels.assign}</option>
        // <option value="new">${labels.createTeamMember}</option>
        const select = document.createElement("select");
        select.setAttribute("id", "select-team-member");

        const option1 = document.createElement("option");
        option1.setAttribute("value", "");
        option1.innerHTML = labels.assign;
        
        const option2 = document.createElement("option");
        option2.setAttribute("value", "");
        option2.innerHTML = labels.createTeamMember;
        
        select.appendChild(option1);
        select.appendChild(option2);

        team?.forEach(member => {
            const option = document.createElement("option");
            option.value = member.id;
            option.innerHTML = member.name;
            select.appendChild(option);
        });

        // Core info (always visible)
        // For due date: use either due date (if set) or default to 1 week from now
        container.innerHTML = `
            <!-- Title + Prio -->
            <div class="todo-detail-title-row">
                <input id="todo-title-input" type="text" class="todo-title" value="${todo.title ?? 'Neues Todo'}">
                <span class="prio-label prio-${todo.prio}" data-todo-id="${todo.id}" title="${labels.changePrio} (Alt + P)">!</span>
            </div>

            <!-- Notes / Description -->
                <div class="notes-container">
                    <label for="todo-notes" class="todo-details-label">Notes:</label>
                    <textarea name="todo-notes" id="todo-notes" class="todo-notes" rows="3" autocorrect="off">${todo.notes ?? ""}</textarea>
                </div>
                
                <!-- Creation Date & Due Date -->
                <div class="two-col-details-container" id="dates-container">
                <label for="due-date" id="calendar-icon" title="${labels.editDue}">📅</label>
                <div class="dates-container">
                    <div>
                        <span id="created-label" class="todo-details-label">${labels.created}</span>
                        <input type="date" id="created-date" value="${DiaryEntry.formatDate(todo.createdDate)}" readonly>
                    </div>
                    <div>
                        <span id="due-label" class="todo-details-label">${labels.due}</span>
                        <input type="date" id="due-date" min="${DiaryEntry.formatDate(now)}" value="${todo.dueDate ? DiaryEntry.formatDate(todo.dueDate) : DiaryEntry.formatDate(new Date(Date.now() + (7  * 24 * 60 * 60 * 1000)))}">
                    </div>
                </div> 
            </div>

            <!-- Checklist -->
            <div class="two-col-details-container" id="checklist-container">
                <span><strong>${SYMBOLS.CHECKLIST}</strong></span>
                <div>
                    <span class="todo-details-label checklist-link">${labels.checklist}</span>
                    <span class="todo-details-label checklist-counter">(${todo.checklist.length})</span>
                </div>
            </div>

            <!-- Categories -->
            <div class="two-col-details-container" id="categories-container">
                <span><strong>#</strong></span>
                <input type="text" id="categories-display" placeholder="${catStr}">
            </div>

            <!-- Assigned team member -->
            <div class="two-col-details-container" id="assignment-container">
                <label for="select-team-member">${SYMBOLS.PERSON}</label>
                ${select.outerHTML}
            </div>

            <!-- Save & Abort buttons-->
            <div class="buttons-container">
                <button id="save-btn" title="${labels.save} (Alt + S)">${labels.save}</button>
                <button id="abort-btn" title="${labels.abort} (Alt + A)">${labels.abort}</button>
            </div>
        `;



        // Bind event listeners
        container.querySelector(".prio-label").addEventListener("click", () => {
            callbacks.onPrioChange?.()
        });
        container.querySelector(".checklist-link").addEventListener("click", () => {
            callbacks.onViewChecklist?.()
        });

        container.querySelector("#categories-display").addEventListener("focus", categories.activateEdit);

        container.querySelector("#categories-display").addEventListener("blur", categories.parseAndUpdate);

        container.querySelector("#save-btn").addEventListener("click", () => {
            callbacks.onSave?.();
        });

        container.querySelector("#abort-btn").addEventListener("click", () => {
            callbacks.onAbort?.();
        });

        // event listeners for keyboard shortcuts
        UI_Manager.registerKeydownHandler(callbacks, { mode: "details" });
        window.addEventListener("keydown", UI_Manager.activeKeydownHandler, { capture: false });

        return container;
    }
    
}
