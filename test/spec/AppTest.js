import { APP_CONST } from "../../js/const.js";
import { app } from "../../js/index.js";
import { ToDo } from "../../js/ToDo.js";
import "../lib/jasmine-6.2.0/jasmine.js";

describe("ToDoApp class test suite", () => {

    
    beforeAll(() => {

        //console.clear();
        
        // clear old storage + app todos array
        localStorage.removeItem("TODO_COLLAPP_USER_TODOS");
        app.todos = [];

        // add 2 test todos
        app.addToDo({
                 title: "Test-ToDo 1",
                 notes: "this is a basic test todo"
            });   

        app.addToDo({
                 title: "Test-ToDo 2",
                 notes: "this is a 2nd basic test todo"
             });
    });  

    it("should contain an array of 2 todos as todos property if 2 todos are added", () => {
        expect(app.todos.length).toEqual(2);
    })

    it("should save all todos", () => {
        app.todos = [];
        console.log(app.todos);

        app.addToDo({title: "Todo 1"});
        app.addToDo({title: "Todo 2"});
        app.saveAllToDos();
        
        const savedToDos = app.loadAllToDos();  
        expect(savedToDos.length).toBe(2);
    })

    it("should load all todos", () => {
        app.todos = [];
        console.log(app.todos);

        app.addToDo({title: "Todo 1"});
        app.addToDo({title: "Todo 2"});
        app.saveAllToDos();

        const savedToDos = app.loadAllToDos();
        expect(savedToDos.length).toBe(2);
    })

    it("can add projects", () => {
        const countBefore = app.projects.length;
        app.addProject("New cool project");
        expect(countBefore).toEqual(app.projects.length - 1);
    })

    it("can delete projects", () => {
        const proj = app.addProject("RemovableProject");
        const countBefore = app.projects.length;
        app.deleteProject(proj);
        expect(countBefore).toEqual(app.projects.length + 1);
    })

    it("should save all projects", () => {
        app.projects = [];
        app.addProject("Project 1");
        app.addProject("Project 2");
        app.saveAllProjects();

        const savedCount = app.loadAllProjects().length;
        expect(savedCount).toBe(app.projects.length);
    })

    it("should load all projects", () => {
        app.projects = [];
        app.addProject("Project 1");
        app.addProject("Project 2");
        app.saveAllProjects();
        app.projects = [];
        app.projects = app.loadAllProjects();
        expect(app.projects.length).toEqual(2);
        
        console.log(app.projects);
    })
})
