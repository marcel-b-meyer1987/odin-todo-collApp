
// DIETER

import { APP_CONST } from "./const.js";
import { ToDo } from "./ToDo.js";
import { Project } from "./Project.js";
import { UI_Manager } from "./UI_Manager.js";

export default class ToDoApp {

    constructor() {
        this.categories = this.loadAllCategories() || ["Uncategorized"];
        this.projects = this.loadAllProjects() || [];
        this.teamMembers = [];
        this.toDos = this.loadAllToDos() || [];
        this.UI_Manager = new UI_Manager(this);
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
        let key = APP_CONST.STORAGE_KEYS.PREFIX; 
            key += APP_CONST.STORAGE_KEYS.USER; // may be change to user ID or some such later in multi-user version
            key += APP_CONST.STORAGE_KEYS.TODOS;

        const todoObjsArr = JSON.parse(localStorage.getItem(key));

        if (todoObjsArr === null) return []; // return early if nothing to load

        const toDoInstances = [];

        for (let i = 0; i < todoObjsArr.length; i++) {
            toDoInstances.push(ToDo.fromStorage(todoObjsArr[i].id));
        }

        return toDoInstances;
    }

    loadAllCategories = () => {
        let key = APP_CONST.STORAGE_KEYS.PREFIX;
            key += APP_CONST.STORAGE_KEYS.USER;
            key += APP_CONST.STORAGE_KEYS.CATS;

        return JSON.parse(localStorage.getItem(key));
    }

    loadAllProjects = () => {
        let key = APP_CONST.STORAGE_KEYS.PREFIX;
            key += APP_CONST.STORAGE_KEYS.USER;
            key += APP_CONST.STORAGE_KEYS.PROJECTS;

        const projectsData = JSON.parse(localStorage.getItem(key));
        
        // if no projects stored, return an empty array
        if (!projectsData) return [];

        // else create a projects array
        const projects = [];

        // loop through each project's dataset...
        for (let i = 0; i < projectsData.length; i++) {
            const {
                    name,
                    creationTimestamp,
                    deadline,
                    toDos
                } = projectsData[i];

            // and create a fresh Instance of the Project class, populated with the respective data
            const proj = new Project(name);
            proj.creationTimestamp = creationTimestamp;
            proj.deadline = deadline;
            proj.toDos = toDos;

            // then push the re-instantiated project into the array
            projects.push(proj);
        }

        return projects;
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
