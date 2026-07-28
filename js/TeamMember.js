import { DB_Handler } from "./DB_Handler.js";
import { APP_CONST } from "./const.js";
import { ToDo } from "./ToDo.js";

export class TeamMember {

    // in-memory cache for team members (key = id)
    static #cache = new Map();

    static indexKey = APP_CONST.STORAGE_KEYS.PREFIX +
                        APP_CONST.STORAGE_KEYS.USER +
                        APP_CONST.STORAGE_KEYS.TEAM;
    
    constructor(memberData) {
        // allows instantiating with string (=name) or object (=more properties) as argument
        const data = typeof memberData === "string" ? { name: memberData } : memberData;
        const { id, name, registrationTimestamp, categories, projects, toDos } = data;
        
        this.id = id || crypto.randomUUID();
        this.name = name || "New Team Member";
        this.registrationTimestamp = Date.now();
        this.categories = [];
        this.projects = []; // holds project names
        this.toDos = []; // holds todo IDs (=strings)

        this.saveToStorage();
    }

    // Get global index of all team member IDs from storage
    static getGlobalIndex() {
        const data = DB_Handler.getItem(TeamMember.indexKey);
        return data ? JSON.parse(data) : [];
    }

    static #addToGlobalIndex(memberID) {
        const index = TeamMember.getGlobalIndex();
        if (! index.includes(memberID)) {
            index.push(memberID);
            DB_Handler.saveItem(TeamMember.indexKey, JSON.stringify(index));
        }
    }
    
    static #removeFromGlobalIndex(memberID) {
        let index = TeamMember.getGlobalIndex();
        index = index.filter(id => id !== memberID);
        DB_Handler.saveItem(TeamMember.indexKey, JSON.stringify(index));
    }

    saveToStorage() {
        // ID serves as DB key and map key for the cache
        DB_Handler.saveItem(this.id, JSON.stringify(this));
        TeamMember.#cache.set(this.id, this);
        TeamMember.#addToGlobalIndex(this.id);
    }
    
    static fromStorage(memberID) {
        if (!memberID) return null;
        if (TeamMember.#cache.has(memberID)) return TeamMember.#cache.get(memberID);

        const data = DB_Handler.getItem(memberID);
        if (!data) {
            console.warn(`Team member with ID ${memberID} not found.`);
            return null;
        }

        try {
            const parsed = JSON.parse(data);
            return new TeamMember(parsed);
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    static clearCache() {
        TeamMember.#cache.clear();
    }

    static delete(memberID) {
        if (!memberID) return 1;
        const memberToDelete = TeamMember.fromStorage(memberID);
        if (!memberToDelete) return 1;

        // Inbox policy: unassign all assigned ToDos
        if (memberToDelete.toDos && memberToDelete.toDos.length > 0) {
            memberToDelete.toDos.forEach(todoID => {
                const todo = ToDo.fromStorage(todoID);
                if (todo) {
                    todo.assignedTo = undefined; // Zuweisung aufheben
                    todo.saveToStorage();
                }
            });
        }

        // remove from index, DB and cache
        TeamMember.#removeFromGlobalIndex(memberID);
        DB_Handler.removeItem(memberID);
        TeamMember.#cache.delete(memberID);
        return 0;
    }
    
    assignToDo(todoID) {
        // if the todoID is not already in the ToDo list of the team member, add it and return 0 as success code
        // if todoID was already in the ToDo-List of the team member, return 1 as error code

        if (this.toDos.indexOf(todoID) < 0) {
            // 1. register ToDo-ID with team member
            this.toDos.push(todoID);
            this.saveToStorage();

            // 2. link team member to ToDo 
            const associatedTodo = ToDo.fromStorage(todoID);
            if (associatedTodo && associatedTodo.assignedTo !== this.id) {
                associatedTodo.assignedTo = this.id;
                associatedTodo.saveToStorage(); // refresh DB and cache for the ToDo
            }

            return 0; // success
        } else {
            return 1;
        }
    }

    unassignToDo(todoID) {
        const index = this.toDos.indexOf(todoID);
        if (index < 0) return 1;

        // 1. remove ToDo-ID from team member
        this.toDos.splice(index, 1);
        this.saveToStorage();

        // 2. remove team member from ToDo
        const associatedTodo = ToDo.fromStorage(todoID);
        if (associatedTodo && associatedTodo.assignedTo === this.id) {
            associatedTodo.assignedTo = undefined;
            associatedTodo.saveToStorage();
        }
        return 0;
    }

    addCategory(category) {
        const trimmed = category.trim();
        if (trimmed === "" || this.categories.includes(trimmed)) return 1;
        
        this.categories.push(trimmed);
        this.saveToStorage();
        return 0;
    }

    removeCategory(category) {
        const index = this.categories.indexOf(category);
        if (index < 0) return 1;    // if category is not in list (anymore), return 1 (error)

        this.categories.splice(index, 1);
        this.saveToStorage();
        return 0;
    }

    addToProject(projectName) {
        if (this.projects.indexOf(projectName) >= 0) return 1; // if project already in list, return early 

        this.projects.push(projectName);
        this.saveToStorage();
        return 0;
    }

    removeFromProject(projectName) {
        const index = this.projects.indexOf(projectName);

        if (index < 0) return 1;    // if project is not assigned (anymore), return 1 (error)

        this.projects.splice(index, 1);
        this.saveToStorage();
        return 0;
    }
}