
// DIETER

import { APP_CONST } from "./const.js";
import { DB_Handler } from "./DB_Handler.js";
import { DiaryEntry } from "./DiaryEntry.js";
import { ProgressEntry } from "./ProgressEntry.js";
import { Project } from "./Project.js";
import { TeamMember } from "./TeamMember.js";
import { ToDo } from "./ToDo.js";
import { UI_Manager } from "./UI_Manager.js";

export default class ToDoApp {

    constructor() {
        
        // CONNECT DATA FROM BUSINESS LOGIC MODULES
        this.categories = this.loadAllCategories() ?? [APP_CONST.DEFAULT_SETTINGS.NO_CAT_STD_LABEL];
        this.projects = this.loadAllProjects() ?? [];
        this.teamMembers = this.loadAllTeamMembers() ?? [];
        this.toDos = this.loadAllToDos() ?? [];
        
        // CONNECT UI BIDIRECTIONALLY (DEPENDENCY INJECTION)
        this.UI_Manager = new UI_Manager(this);

        // LOGIN + SESSION MANAGEMENT
        // check if a user is logged in and, if yes, who it is
        let currentUser = TeamMember.getCurrentUser(); // TeamMember instance or null

        if (currentUser) {
            console.log(`Willkommen zurück, ${currentUser.name}. Lade dein Dashboard...`);
            // Add trigger for usual dashboard rendering here
            this.UI_Manager.renderDashboard({ userID: currentUser.id });
        } else {
            console.log("Kein Benutzer angemeldet. Zeige Login- / Finde-Bildschirm.");
            // Redirect to Login Screen
        }


        // import constants 
        this.CatIndexKey = APP_CONST.STORAGE_KEYS.PREFIX +
                            APP_CONST.STORAGE_KEYS.USER +
                            APP_CONST.STORAGE_KEYS.CATS;

        // *** THESE SHOULD NOT BE NEEDED HERE AFTER ALL, THANKS TO ENCAPSULATION ***
        // this.ToDoIndexKey = APP_CONST.STORAGE_KEYS.PREFIX +
        //                     APP_CONST.STORAGE_KEYS.USER +
        //                     APP_CONST.STORAGE_KEYS.TODOS;
        // this.ProjectIndexKey = APP_CONST.STORAGE_KEYS.PREFIX +
        //                         APP_CONST.STORAGE_KEYS.USER +
        //                         APP_CONST.STORAGE_KEYS.PROJECTS;
    }


    addToDo = (configObj) => {
        this.todos.push(new ToDo(configObj));
    }

    addCategory = (newCat) => {
        if (newCat.trim().length < 1) return 1; // no empty strings allowed - ext w/ error
        if(this.categories.includes(newCat.trim())) return 1; // prevent duplicates

        // add to cats object in RAM + update index
        this.categories.push(newCat.trim());
        DB_Handler.saveItem(this.CatIndexKey, JSON.stringify(this.categories));
        return 0; // success
    }


    deleteProject = (projectName) => {
        return Project.delete(projectName);
    }

    deleteCategory = (catName) => {
        if (catName === APP_CONST.DEFAULT_SETTINGS.NO_CAT_STD_LABEL) return 1; // Fallback may not be deleted

        this.categories = this.categories.filter(cat => cat !== catName);
        DB_Handler.saveItem(this.CatIndexKey, JSON.stringify(this.categories));

        // remove the category from each todo which was assigned to it
        const allTodos = this.loadAllToDos();
        allTodos.forEach(todo => {
            if (todo.categories.includes(catName)) {
                // remove deleted cat from todo
                todo.categories = todo.categories.filter(c => c !== catName);
                // if no categories left, set to default
                if (todo.categories.length < 1) {
                    todo.categories.push(APP_CONST.DEFAULT_SETTINGS.NO_CAT_STD_LABEL);
                }
                // save update
                todo.saveToStorage();
            }
        });

        return 0; // success
    }

    loadAllToDos = () => {
        // get a list of all ToDo IDs in the storage
        const todoIDs = ToDo.getGlobalIndex();

        // if no IDs in storage = no ToDos either => return empty array
        if (todoIDs.length < 1) return [];

        // iterate over all IDs and load the ToDos from storage to the cache
        const allTodos = todoIDs.map(id => ToDo.fromStorage(id));

        return allTodos;
    }

    loadAllCategories = () => {
        let categories = [];

        const data = DB_Handler.getItem(this.CatIndexKey);

        if (data) {
            categories = JSON.parse(data);
        } else {
            categories = [APP_CONST.DEFAULT_SETTINGS.NO_CAT_STD_LABEL];
            // in case nothing was set up in storage, set it up now
            DB_Handler.saveItem(this.CatIndexKey, JSON.stringify(categories));
        }
        
        return categories;
    }

    loadAllProjects = () => {
        const projectNames = Project.getGlobalIndex();
        
        // if no names = no projects => return empty array
        if (projectNames.length < 1) return [];

        // load all projects into cache and return as array
        return projectNames.map(name => Project.fromStorage(name)).filter(Boolean);
    }

    loadAllTeamMembers = () => {
        const memberIDs = TeamMember.getGlobalIndex();
        if (memberIDs.length < 1) return [];
        
        // load all team members from storage into cache using the IDs from thr index
        return memberIDs.map(id => TeamMember.fromStorage(id));
    }

    loadAllDiaryEntries = () => {
        /**
         ** Loads all diary entries from storage into memory on cold start
         ** @returns {DiaryEntry[]} Array of all loaded entries
         */
        const diaryDates = DiaryEntry.getGlobalIndex();
        if (diaryDates.length < 1) return [];

        // Loads all entries into cache via date key
        return diaryDates.map(dateStr => DiaryEntry.fromStorage(dateStr));
    };
}
