import { TODO_STATUS, TODO_PRIO, APP_CONST } from "../js/const.js";

export class ToDoDetail {
    /**
     ** Creates the DOM Element for the detail view of a ToDo
     ** @param {ToDo} todo - The ToDo Object
     ** @param {string} userLang - User language ('de' or 'en')
     ** @param {Object} callbacks - click actions (e. g. Back, Edit)
     */
    static create(todo, userLang, callbacks) {
        const container = document.createElement("div");
        container.className = "todo-detail-container";
        container.style.padding = "var(--spacing-unit)";

        // Localisation for the labels
        const labels = {
            de: { title: "Aufgabe", notes: "Notizen", priority: "Priorität", subtasks: "Unteraufgaben", back: "⬅️ Zurück", more: "Zusatzinfos einblenden 👇" },
            en: { title: "Task", notes: "Notes", priority: "Priority", subtasks: "Sub-tasks", back: "⬅️ Back", more: "Show additional details 👇" }
        }[userLang] || labels[APP_CONST.DEFAULT_SETTINGS.LANG];

        // Core info (always visible)
        container.innerHTML = `
            <button class="back-btn" style="margin-bottom: 1em;">${labels.back}</button>
            <h2 class="todo-title" style="color: var(--accent-color); margin-top: 0;">${todo.title}</h2>
            
            <!-- Accordeon for saving space -->
            <details class="mobile-accordion" style="border: 1px solid var(--border-color); padding: 0.5em; border-radius: 4px; margin-top: 1em;">
                <summary style="cursor: pointer; font-weight: bold; color: var(--text-muted);">${labels.more}</summary>
                
                <div class="accordion-content" style="margin-top: 1em;">
                    <p><strong>${labels.priority}:</strong> ${Object.keys(TODO_PRIO).find(key => TODO_PRIO[key] === todo.prio)}</p>
                    <p><strong>${labels.notes}:</strong> ${todo.notes || "---"}</p>
                    
                    <div class="categories-list">
                        <strong>Kategorien:</strong>
                        ${todo.categories.map(cat => `<span class="cat-tag" style="background: var(--secondary-color); padding: 2px 6px; margin-right: 5px; border-radius: 3px; font-size: 0.85em;">${cat}</span>`).join('')}
                    </div>
                </div>
            </details>
        `;

        // Event-Listener binden
        container.querySelector(".back-btn").addEventListener("click", () => {
            callbacks.onBack?.();
        });

        return container;
    }
}
