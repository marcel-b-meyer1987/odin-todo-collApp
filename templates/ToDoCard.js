import { TODO_STATUS } from "../js/const.js";

export class ToDoCard {
    /**
     * Creates an isolated ToDoCard for the list of search results
     * @param {ToDo} todo - The ToDo data object
     * @param {Object} callbacks - Functions that should be called when clicking on buttons
     */
    static create(todo, callbacks) {
        const li = document.createElement("li");
        li.className = "todo-card-item";
        li.style.padding = "var(--spacing-unit)";
        li.style.borderBottom = "1px solid var(--border-color)";

        // Fill HTML structure with data
        li.innerHTML = `
            <div class="todo-card-row">
                <span class="todo-card-title">${todo.title}</span>
                <div class="todo-card-actions">
                    <button class="card-btn complete-btn" title="Als erledigt markieren">✅</button>
                    <button class="card-btn delete-btn" title="Löschen">🗑️</button>
                </div>
            </div>
        `;

        // immediately hook up event listeners to buttons + card
        li.querySelector(".complete-btn").addEventListener("click", (e) => {
            e.stopPropagation(); // Verhindert das Trigger der Detailansicht
            todo.markAsCompleted(); // Deine Logik-Methode
            callbacks.onComplete?.(todo);
        });

        li.querySelector(".delete-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            callbacks.onDelete?.(todo);
        });

        // Klick auf die Karte öffnet laut Design.md die Detailansicht
        li.addEventListener("click", () => {
            callbacks.onViewDetails?.(todo);
        });

        return li;
    }
}
