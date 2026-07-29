
// DIETER

import { APP_CONST } from "./const.js";
import { ToDo } from "./ToDo.js";
import { Project } from "./Project.js";
import { DB_Handler } from "./DB_Handler.js";
import { UI_Manager } from "./UI_Manager.js";

export default class ToDoApp {

    constructor() {
        this.categories = this.loadAllCategories() || [APP_CONST.DEFAULT_SETTINGS.NO_CAT_STD_LABEL];
        this.projects = this.loadAllProjects() || [];
        this.teamMembers = [];
        this.toDos = this.loadAllToDos() || [];
        this.UI_Manager = new UI_Manager(this);

        // import constants
        this.ToDoIndexKey = APP_CONST.STORAGE_KEYS.PREFIX +
                            APP_CONST.STORAGE_KEYS.USER +
                            APP_CONST.STORAGE_KEYS.TODOS;
        this.ProjectIndexKey = APP_CONST.STORAGE_KEYS.PREFIX +
                                APP_CONST.STORAGE_KEYS.USER +
                                APP_CONST.STORAGE_KEYS.PROJECTS;
        this.CatIndexKey = APP_CONST.STORAGE_KEYS.PREFIX +
                            APP_CONST.STORAGE_KEYS.USER +
                            APP_CONST.STORAGE_KEYS.CATS;
    }


    addToDo = (configObj) => {
        this.todos.push(new ToDo(configObj));
    }

    addCategory = (newCat) => {
        // if newCat is an empty string, return with exit code 1 (error)
        if (newCat.trim().length < 1) return 1;

        // prevent duplicates
        if(!this.categories.includes(newCat.trim())) {
            // add to cats object in RAM + update index
            this.categories.push(newCat.trim());
            DB_Handler.saveItem(this.CatIndexKey, JSON.stringify(this.categories));
            return 0; // success
        }

        return 1; // Error: already existing
    }

    addProject = (projName) => {
        const newProj = new Project({name: projName});
        this.projects.push(newProj);
        return newProj;
    }

    deleteProject = (proj) => {
        const i = this.projects.indexOf(proj);
        
        // if the proj is not find in the array, return -1 as flag ("not in array")
        if (i === -1) return i;

        // otherwise, remove the project out of the array and return the index of the (now deleted) project
        this.projects.splice(i, 1);
        return i;
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
        return projectNames.map(name => Project.fromStorage(name));
    }

    loadAllTeamMembers = () => {
        const memberIDs = TeamMember.getGlobalIndex();
        if (memberIDs.length < 1) return [];
        
        // load all team members from storage into cache using the IDs from thr index
        return memberIDs.map(id => TeamMember.fromStorage(id));
    }


    // saveAllToDos= () => {
    //     // NEEDS A REWRITE    

    //     localStorage.setItem(key, JSON.stringify(this.todos));
    //     console.log(`Saved ${this.todos.length} todos under ${key}.`);
    // }

    saveAllCategories = () => {
        let key = APP_CONST.STORAGE_KEYS.PREFIX;
            key += APP_CONST.STORAGE_KEYS.USER;
            key += APP_CONST.STORAGE_KEYS.CATS;

        localStorage.setItem(key, JSON.stringify(this.categories));
        console.log(`Saved ${this.categories.length} categories under ${key}.`);
    }

    saveAllProjects = () => {
        let key = APP_CONST.STORAGE_KEYS.PREFIX;
            key += APP_CONST.STORAGE_KEYS.USER;
            key += APP_CONST.STORAGE_KEYS.PROJECTS;

        localStorage.setItem(key, JSON.stringify(this.projects));
        console.log(`Saved ${this.projects.length} projects under ${key}.`);
    }

}
