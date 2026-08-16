import { TODO_STATUS, TODO_PRIO, APP_CONST, UI_CONST, SYMBOLS } from "../js/const.js";
import { DiaryEntry } from "../js//DiaryEntry.js";

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
        const labels = {
            de: { title: "Aufgabe", notes: "Notizen", editDue : "Fälligkeitsdatum bearbeiten", created : "Erstellt:", due: "Fällig", checklist : "Checkliste bearbeiten", cats : "Kategorie hinzufügen", assign : "Mitarbeiter zuweisen", createTeamMember : "Mitarbeiter erstellen", save : "Speichern", abort : "Abbrechen" },
            en: { title: "Task", notes: "Notes", editDue : "Edit Due Date", created : "Created on:", due : "Due date:", checklist : "Edit checklist", cats : "Add category", assign : "Assign to Team Member", createTeamMember : "Add New Team Member", save : "Save", abort : "Abort" },
        }[userLang] || labels[APP_CONST.DEFAULT_SETTINGS.LANG];

        // helper variables
        const now = new Date();
        const catStr = todo.categories?.join(", ") || "";
        const team = app.teamMembers;

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
                <input id="todo-title-input" type="text" class="todo-title" placeholder="${todo.title ?? 'Neues Todo'}">
                <span class="prio-label prio-${todo.prio}" data-todo-id="${todo.id}">!</span>
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
                <span><strong>&#9745</strong></span>
                <div>
                    <span class="todo-details-label checklist-link">${labels.checklist}</span>
                    <span class="todo-details-label checklist-counter">(${todo.checklist.length})</span>
                </div>
            </div>

            <!-- Categories -->
            <div class="two-col-details-container" id="categories-container">
                <span><strong>#</strong></span>
                <input type="text" id="categories-display" placeholder="${todo.categories ? catStr : ''}">
            </div>

            <!-- Assigned team member -->
            <div class="two-col-details-container" id="assignment-container">
                <label for="select-team-member">${SYMBOLS.PERSON}</label>
                ${select.outerHTML}
            </div>

            <!-- Save & Abort buttons-->
            <div class="buttons-container">
                <button id="save-btn">${labels.save}</button>
                <button id="abort-btn">${labels.abort}</button>
            </div>
        `;



        // Bind event listeners
        container.querySelector(".prio-label").addEventListener("click", () => {
            callbacks.onPrioChange?.()
        });
        container.querySelector(".checklist-link").addEventListener("click", () => {
            callbacks.onViewChecklist?.()
        });

        container.querySelector("#save-btn").addEventListener("click", () => {
            callbacks.onSave?.();
        });

        container.querySelector("#abort-btn").addEventListener("click", () => {
            callbacks.onAbort?.();
        });

        return container;
    }
}
