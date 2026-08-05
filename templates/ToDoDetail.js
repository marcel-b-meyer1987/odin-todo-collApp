import { TODO_STATUS, TODO_PRIO, APP_CONST } from "../js/const.js";
import { DiaryEntry } from "../js//DiaryEntry.js";

export class ToDoDetail {
    /**
     ** Creates the DOM Element for the detail view of a ToDo
     ** @param {ToDo} todo - The ToDo Object
     ** @param {string} userLang - User language ('de' or 'en'), default = app default
     ** @param {Object} callbacks - click actions (e. g. Back, Edit)
     */
    static create(todo, userLang = APP_CONST.DEFAULT_SETTINGS.LANG, callbacks) {
        const container = document.createElement("div");
        container.className = "todo-detail-container";

        // Localisation for the labels
        const labels = {
            de: { title: "Aufgabe", notes: "Notizen", editDue : "Fälligkeitsdatum bearbeiten", created : "Erstellt:", due: "Fällig", checklist : "Checkliste bearbeiten", cats : "Kategorie hinzufügen", assign : "Mitarbeiter zuweisen", createTeamMember : "Mitarbeiter erstellen", save : "Speichern", abort : "Abbrechen" },
            en: { title: "Task", notes: "Notes", editDue : "Edit Due Date", created : "Created on:", due : "Due date:", checklist : "Edit checklist", cats : "Add category", assign : "Assign to Team Member", createTeamMember : "Add New Team Member", save : "Save", abort : "Abort" },
        }[userLang] || labels[APP_CONST.DEFAULT_SETTINGS.LANG];

        // Core info (always visible)
        container.innerHTML = `
            <!-- Title + Prio -->
            <div class="todo-detail-title-row">
                <input type="text" class="todo-title" placeholder="${todo.title ?? 'Neues Todo'}">
                <span class="prio-label">!</span>
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
                        <input type="date" id="created-date" value="${DiaryEntry.formatDate(todo.creationDate)}" readonly>
                    </div>
                    <div>
                        <span id="due-label" class="todo-details-label">${labels.due}</span>
                        <input type="date" id="due-date" value="2026-08-10">
                    </div>
                </div> 
            </div>

            <!-- Checklist -->
            <div class="two-col-details-container" id="checklist-container">
                <span><strong>&#9745</strong></span>
                <span class="todo-details-label checklist-link">${labels.checklist}</span>
            </div>

            <!-- Categories -->
            <div class="two-col-details-container" id="categories-container">
                <span><strong>#</strong></span>
                <input type="text" id="categories-display" placeholder="${labels.cats}">
            </div>

            <!-- Assigned team member -->
            <div class="two-col-details-container" id="assignment-container">
                <label for="select-team-member">👤</label>
                <select id="select-team-member">
                    <option value="">${labels.assign}</option>
                    <option value="new">${labels.createTeamMember}</option>
                </select>
            </div>

            <!-- Save & Abort buttons-->
            <div class="buttons-container">
                <button id="save-btn">${labels.save}</button>
                <button id="abort-btn">${labels.abort}</button>
            </div>
        `;

        // Event-Listener binden
        container.querySelector("#save-btn").addEventListener("click", () => {
            callbacks.onSave?.();
        });
        container.querySelector("#abort-btn").addEventListener("click", () => {
            callbacks.onAbort?.();
        });

        return container;
    }
}
