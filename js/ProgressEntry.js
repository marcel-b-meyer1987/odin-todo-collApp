import { DB_Handler } from "./DB_Handler.js";
import { TODO_STATUS, TODO_PRIO, APP_CONST } from "./const.js";
import { ToDo } from "./ToDo.js";
import { DiaryEntry } from "./DiaryEntry.js"; // Für die formatDate-Hilfsmethode
import { TeamMember } from "./TeamMember.js";
import { Project } from "./Project.js";

export class ProgressEntry {
    
    static #cache = new Map();
    static #indexKey = APP_CONST.STORAGE_KEYS.PROGRESS;

    constructor(data) {
        const { memberID, dateStr, totalDone, prioDistribution, categoryDistribution, projectProgress } = data;
        
        this.memberID = memberID;
        this.dateStr = dateStr || DiaryEntry.formatDate(new Date());
        
        // init metrics
        this.totalDone = totalDone || 0;
        this.prioDistribution = prioDistribution || { high: 0, normal: 0, low: 0 };
        this.categoryDistribution = categoryDistribution || {};
        this.projectProgress = projectProgress || {};

        // unique combinated key for cache and storage
        this.storageKey = `${ProgressEntry.#indexKey}_${this.memberID}_${this.dateStr}`;
        
        // save to cache + storage
        this.saveToStorage();
    }

    saveToStorage() {
        DB_Handler.saveItem(this.storageKey, JSON.stringify(this));
        ProgressEntry.#cache.set(this.storageKey, this);
    }

    static fromStorage(memberID, dateStr) {
        const key = `${APP_CONST.STORAGE_KEYS.PROGRESS}_${memberID}_${dateStr}`;
        if (ProgressEntry.#cache.has(key)) return ProgressEntry.#cache.get(key);

        const data = DB_Handler.getItem(key);
        if (!data) return null;

        try {
            return new ProgressEntry(JSON.parse(data));
        } catch (error) {
            console.error(error);
            return null;
        }
    }
    static updateProgressForToday(memberID) {
            /**
             ** Search all todos in the RAM cache and aggregate today's progress of the team member
             ** Will be called automatically whenever a todo's status gets set to DONE.
             */
        if (!memberID) return;
        
        const todayStr = DiaryEntry.formatDate(new Date());
        
        // 1. Get all todos from the global cache which belong to this member and have been set to DONE today
        const allTodos = Array.from(ToDo.getAllActiveToDos()); // all todos outside trash bin
        
        const todaysDoneTodos = allTodos.filter(todo => 
            todo.assignedTo === memberID && 
            todo.status === TODO_STATUS.DONE && 
            DiaryEntry.formatDate(todo.completedDate) === todayStr
        );

        if (todaysDoneTodos.length === 0) return null;

        // 2. Aggregate metrics
        const prioDist = { high: 0, normal: 0, low: 0 };
        const catDist = {};

        todaysDoneTodos.forEach(todo => {
            // count priorities
            if (todo.prio === TODO_PRIO.HIGH) prioDist.high++;
            if (todo.prio === TODO_PRIO.NORMAL) prioDist.normal++;
            if (todo.prio === TODO_PRIO.LOW) prioDist.low++;

            // count categories
            if (todo.categories) {
                todo.categories.forEach(cat => {
                    catDist[cat] = (catDist[cat] || 0) + 1;
                });
            }
        });

        // 3. Calculate projects progress
        const projProgress = {};
        
        // Hole das Teammitglied, um zu wissen, an welchen Projekten es arbeitet
        const member = TeamMember.fromStorage(memberID); // Stelle sicher, dass TeamMember importiert ist
        
        if (member && member.projects) {
            member.projects.forEach(projectName => {
                const project = Project.fromStorage(projectName);
                if (project && project.toDos && project.toDos.length > 0) {
                    
                    // Lade alle ToDos dieses spezifischen Projekts
                    const projectTodos = project.toDos.map(id => ToDo.fromStorage(id)).filter(Boolean);
                    
                    // Zähle, wie viele ToDos im gesamten Projekt ERLEDIGT sind
                    const doneCount = projectTodos.filter(t => t.status === TODO_STATUS.DONE).length;
                    
                    // Berechne den aktuellen Prozentsatz (z.B. 75%)
                    const percentage = Math.round((doneCount / projectTodos.length) * 100);
                    
                    // Speichere es im Key-Value-Format: { "Projektname": Prozentwert }
                    projProgress[projectName] = percentage;
                }
            });
        }

        // 4. Create (or overwrite) ProgressEntry instance
        const progress = new ProgressEntry({
            memberID: memberID,
            dateStr: todayStr,
            totalDone: todaysDoneTodos.length,
            prioDistribution: prioDist,
            categoryDistribution: catDist,
            projectProgress: projProgress,
        });

        progress.saveToStorage();
        return progress;
    }
}
