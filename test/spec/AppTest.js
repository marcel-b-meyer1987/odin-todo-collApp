import { APP_CONST } from "../../js/const.js";
import { DB_Handler } from "../../js/DB_Handler.js";
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
        DB_Handler.removeItem(app.ToDoIndexKey);

        app.addToDo({title: "Todo 1"});
        app.addToDo({title: "Todo 2"});
        // app.saveAllToDos();
        
        const savedToDos = app.loadAllToDos();  
        expect(savedToDos.length).toBe(2);
    })

    it("should load all todos", () => {
        app.todos = [];
        DB_Handler.removeItem(app.ToDoIndexKey);
        console.log(app.todos);

        app.addToDo({title: "Todo 1"});
        app.addToDo({title: "Todo 2"});
        // app.saveAllToDos();

        const savedToDos = app.loadAllToDos();
        console.log(savedToDos);
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

    it("should preserve categories independently of Todos and fallback to uncategorized", () => {
        // 1. Simulate initial state
        app.loadAllCategories();

        // 2. add category
        const res = app.addCategory("Category-X");
        expect(res).toBe(0);
        expect(app.loadAllCategories()).toContain("Category-X");

        // 3. Create ToDo in this category 
        const testTodo = new ToDo({ id: "cat-test", title: "Task X", categories: ["Category-X"] });
        testTodo.saveToStorage();

        // 4. Delete category explicitly (user action)
        app.deleteCategory("Category-X");

        // 5. Assert: Category has been removed from global Index
        expect(app.loadAllCategories()).not.toContain("Category-X");

        // 6. Assert: ToDo still exists, but has only "uncategorized" as cat (fallback)
        ToDo.clearCache();
        const reloadedTodo = ToDo.fromStorage("cat-test");
        expect(reloadedTodo.categories).toContain("Uncategorized");
        expect(reloadedTodo.categories).not.toContain("Category-X");
    })
})
