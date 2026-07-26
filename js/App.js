
// DIETER

import { APP_CONST } from "./const.js";
import { ToDo } from "./ToDo.js";
import { Project } from "./Project.js";
import { DB_Handler } from "./DB_Handler.js";
import { UI_Manager } from "./UI_Manager.js";

export default class ToDoApp {

    constructor() {
        this.categories = this.loadAllCategories() || ["Uncategorized"];
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

        // else add newCat to categories array and return 0 (success)
        this.categories.push(newCat);
        return 0;
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
        let key = APP_CONST.STORAGE_KEYS.PREFIX;
            key += APP_CONST.STORAGE_KEYS.USER;
            key += APP_CONST.STORAGE_KEYS.CATS;

        return JSON.parse(localStorage.getItem(key));
    }

    loadAllProjects = () => {
        const projectNames = Project.getGlobalIndex();
        
        // if no names = no projects => return empty array
        if (projectNames.length < 1) return [];

        // load all projects into cache and return as array
        return projectNames.map(name => Project.fromStorage(name));
    }

    saveAllToDos= () => {
        let key = APP_CONST.STORAGE_KEYS.PREFIX;
            key += APP_CONST.STORAGE_KEYS.USER;
            key += APP_CONST.STORAGE_KEYS.TODOS;

        localStorage.setItem(key, JSON.stringify(this.todos));
        console.log(`Saved ${this.todos.length} todos under ${key}.`);
    }

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
