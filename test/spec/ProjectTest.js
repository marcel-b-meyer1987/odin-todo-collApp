import { Project } from "../../js/Project.js";
import { ToDo } from "../../js/ToDo.js";
import { DB_Handler } from "../../js/DB_Handler.js"

describe("Project class test suite", () => {

    let todo0;
    let todo1;
    let proj;
    let mockStorage;
    const currentYear = new Date(Date.now()).getFullYear();
    const pastDate = new Date();
    pastDate.setFullYear(currentYear-1);
    const futureDate = new Date();
    futureDate.setFullYear(currentYear+1);
    console.log(pastDate);
    console.log(futureDate);

    beforeAll(() => {
        todo0 = new ToDo({title: "New Todo 0"});
        todo1 = new ToDo({title: "New ToDo 1"});
        proj = new Project({name: "Project RiseAndShine"});
        proj.addToDo(todo0.id);
        
        // For mocking storage
        mockStorage = {};
        
        spyOn(DB_Handler, "saveItem").and.callFake((key, value) => {
            mockStorage[key] = String(value);
        });

        spyOn(DB_Handler, "getItem").and.callFake(key => {
            return mockStorage[key] || null;
        });

    })

    it("creates an instance of the Project class", () => {
        expect(proj instanceof Project).toBe(true);
    })

    it("can change its name", ()=> {
        expect(proj.changeName("New Project Name")).toBe(0);
        
    })

    it("can add ToDos to its list", () => {
        proj.addToDo(todo1.id);
        expect(proj.toDos.indexOf(todo1.id) >= 0).toBe(true);
    })

    it("should not add the same ToDo more than once", () => {
        expect(proj.addToDo(todo0.id) > 0).toBe(true);
    })

    it("can remove a todo from its list", () => {
        proj.addToDo(todo1.id);
        proj.removeToDo(todo1.id);
        expect(proj.toDos.indexOf(todo1.id) < 0).toBe(true);
    })

    it("should be able to set a deadline", () => {
        expect(proj.setDeadline(Date.now())).toBe(0);
    })

    it("should not set a deadline to a past point of time", () => {
        expect(proj.setDeadline(pastDate)).toBe(1);
    })

    it("should be able to set its deadline as due date for its todos", () => {
        proj.setDeadline(Date.now(), true);
        expect(ToDo.fromStorage(proj.toDos[0]).dueDate.getTime()).toEqual(proj.deadline.getTime());
    })

    it("should be able to remove a deadline from a project altogether", () => {
        proj.setDeadline(futureDate);
        proj.removeDeadline();
        expect(proj.deadline).toBe(undefined);
    })

    it("should be able to save a project to storage and load it from storage", () => {
        proj.saveToStorage();
        const reloadedProject = Project.fromStorage(proj.name);
        console.log(reloadedProject);
        expect(reloadedProject instanceof Project).toBe(true);
    })

    it("should persist name changes to storage", () => {
        // 1. Arrange
        const projectToTest = new Project({ name: "Persistence Test"});

        // 2. Act
        projectToTest.changeName("Successfully persisted Name");

        Project.clearCache();

        // 3. Assert
        const reloaded = Project.fromStorage("Successfully persisted Name");
        expect(reloaded).not.toBeNull();
        expect(reloaded.name).toBe("Successfully persisted Name");
    })

    it("should persist added ToDo IDs to storage", () => {
        // 1. Arrange
        const projectToTest = new Project({ name: "Todo Persistence Project"});
        const testTodoID = "todo-123-xyz";

        // 2. Act
        projectToTest.addToDo(testTodoID);
        Project.clearCache(); // exclude cache for testing

        // 3. Assert
        const reloaded = Project.fromStorage("Todo Persistence Project");
        expect(reloaded.toDos).toContain(testTodoID);
    })

    it("should persist new Deadlines to storage", () => {
        // 1. Arrange
        const projectToTest = new Project({ name: "Deadline Project"});
        const targetDate = Date.now() + 100000; // some time in the future

        // 2. Act
        projectToTest.setDeadline(targetDate);
        Project.clearCache();

        // 3. Assert
        const reloaded = Project.fromStorage("Deadline Project");

        // important: Because JSON.parse() returns a date as string,
        // it must be converted to a real date/timestamp for comparison
        const savedTimestamp = new Date(reloaded.deadline).getTime();
        expect(savedTimestamp).toBe(new Date(targetDate).getTime());
    })

    afterAll(() => {
        // log new project class instance for inspection
        console.log(proj);

    })

})

