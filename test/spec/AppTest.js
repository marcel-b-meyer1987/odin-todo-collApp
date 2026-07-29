import { APP_CONST } from "../../js/const.js";
import { DB_Handler } from "../../js/DB_Handler.js";
import { app } from "../../js/index.js";
import { Project } from "../../js/Project.js";
import { ToDo } from "../../js/ToDo.js";
import "../lib/jasmine-6.2.0/jasmine.js";

describe("ToDoApp class test suite", () => {

    
    beforeEach(() => {



        // console.clear();
        
        // clear storage + cache for ToDos + Projects
        app.todos = [];
        ToDo.clearCache();
        ToDo.getGlobalIndex().forEach(id => ToDo.delete(id));

        app.projects = [];
        Project.clearCache();
        Project.getGlobalIndex().forEach(n => Project.delete(n));

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

    // it("can add projects", () => {
    //     const countBefore = app.projects.length;
    //     app.addProject("New cool project");
    //     expect(countBefore).toEqual(app.projects.length - 1);
    // })

    it("can delete projects", () => {
        const proj = new Project({name: "RemovableProject"});
        const countBefore = Project.getGlobalIndex().length;
        Project.delete(proj.name);
        const countAfter = Project.getGlobalIndex().length;
        expect(countBefore).toEqual(countAfter + 1);
    })

    it("should load all projects", () => {
        const proj1 = new Project({name: "Project 1"});
        const proj2 = new Project({name: "Project 2"});
        
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
