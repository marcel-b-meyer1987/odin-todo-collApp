import { ProgressEntry } from "../../js/ProgressEntry.js";
import { ToDo } from "../../js/ToDo.js";
import { DB_Handler } from "../../js/DB_Handler.js";
import { DiaryEntry } from "../../js/DiaryEntry.js";
import { TODO_STATUS, TODO_PRIO, APP_CONST } from "../../js/const.js";
import { Project } from "../../js/Project.js";
import { TeamMember } from "../../js/TeamMember.js";

describe("ProgressEntry class test suite", () => {
    let mockStorage;
    let indexKey = APP_CONST.STORAGE_KEYS.PROGRESS;

    beforeEach(() => {
        mockStorage = {};

        spyOn(DB_Handler, 'saveItem').and.callFake((key, value) => {
            mockStorage[key] = String(value);
        });

        spyOn(DB_Handler, 'getItem').and.callFake((key) => {
            return mockStorage[key] || null;
        });

        ToDo.clearCache();
    });

    it("should automatically calculate and persist stats when a ToDo is marked as DONE", () => {
        const mID = "user-clara-999";
        const todayStr = DiaryEntry.formatDate(new Date());
        const targetStorageKey = `${indexKey}_${mID}_${todayStr}`;

        // 1. Arrange: Create a todo assigned to Clara with high prio
        const task = new ToDo({ 
            id: "task-stat-1", 
            title: "Urgent Code Review", 
            assignedTo: mID,
            prio: TODO_PRIO.HIGH,
            categories: ["Development"]
        });

        // ToDo still in status PENDING, so storage for its stats must not yet be defined
        expect(mockStorage[targetStorageKey]).toBeUndefined();

        // 2. Act: Set status to DONE and save to trigger the progress update
        task.markAsCompleted(); // saves internally

        // 3. Assert: Durch das automatische Speichern im Konstruktor muss das Objekt jetzt in der DB liegen
        expect(DB_Handler.getItem(targetStorageKey)).toBeDefined();

        // 4. Assert: Lade die Statistik frisch aus dem Speicher und prüfe die exakten Metriken
        const stats = JSON.parse(DB_Handler.getItem(targetStorageKey));
        expect(stats.totalDone).toBe(1);
        expect(stats.prioDistribution.high).toBe(1);
        expect(stats.categoryDistribution["Development"]).toBe(1);
    });

    it("should automatically calculate project completion percentages inside the progress entry", () => {
        const mID = "member-project-test";
        const pName = "Project Alpha";
        const todayStr = DiaryEntry.formatDate(new Date());
        const targetStorageKey = `${indexKey}_${mID}_${todayStr}`;

        // 1. Arrange: Erstelle ein Projekt und füge ein Teammitglied hinzu
        const proj = new Project({ name: pName });
        const member = new TeamMember({ id: mID, name: "Clara" });
        proj.addTeamMember(mID);
        
        // Erstelle ZWEI Aufgaben für dieses Projekt
        const t1 = new ToDo({ id: "p-task-1", title: "Task 1", assignedTo: mID });
        const t2 = new ToDo({ id: "p-task-2", title: "Task 2", assignedTo: mID });
        
        proj.addToDo(t1.id);
        proj.addToDo(t2.id);

        // Alles sichern
        proj.saveToStorage();
        member.saveToStorage();
        t1.saveToStorage();
        t2.saveToStorage();

        // 2. Act: Setze EINE von zwei Aufgaben auf DONE (Erfolgsquote sollte 50% sein)
        t1.markAsCompleted();
        t1.saveToStorage(); // Triggert die automatische Berechnung

        // 3. Assert: Aus dem Speicher auslesen und prüfen
        expect(mockStorage[targetStorageKey]).toBeDefined();
        const stats = JSON.parse(mockStorage[targetStorageKey]);
        
        // Das Projekt "Project Alpha" muss jetzt exakt auf 50% stehen
        expect(stats.projectProgress[pName]).toBe(50);
    });

});
