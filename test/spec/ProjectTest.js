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

        spyOn(DB_Handler, "removeItem").and.callFake((key) => {
            delete mockStorage[key];
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
        // 1 .Arrange
        // make sure the project is within the mocked storage
        todo0.saveToStorage();

        // choose a date which is surely in the future to prevent side effects through delay in test runner
        const futureTargetDate = Date.now() + 3600000;

        // 2. Act
        const result = proj.setDeadline(futureTargetDate, true);
        expect(result).toBe(0); // check exit code to ensure success

        // empty caches to prove the data has been persisted in storage + re-loaded from it
        ToDo.clearCache();
        Project.clearCache();

        // 3. Assert
        const reloadedTodo = ToDo.fromStorage(todo0.id);

        // safety check in the test, to ensure a clean error message in case of missing ToDo
        expect(reloadedTodo).not.toBeNull();

        if (reloadedTodo) {
            const savedTodoTime = new Date(reloadedTodo.dueDate).getTime();
            expect(savedTodoTime).toEqual(new Date(futureTargetDate).getTime());
        }

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

    it("should update and persist deadlines of associated todos if affected", () => {
        // 1. Arrange
        const projectName = "Interactions Project";
        const projectToTest = new Project( { name: projectName});

        // create test ToDo with known ID
        const testToDoID = "todo-999";
        projectToTest.addToDo(testToDoID);

        // we simulate a ToDo in storage by adding it to the mockStorage object:
        mockStorage[testToDoID] = JSON.stringify({
            id: testToDoID,
            title: "Integration Test ToDo",
            dueDate: undefined // start out without deadline
        });
        ToDo.clearCache(); // clear cache to prevent loading of the unchanged object from cache

        const futureDeadline = Date.now() + 500000;

        // 2. Act
        projectToTest.setDeadline(futureDeadline, true); // add deadline + set flag for affecting todos

        // 3. Assert
        const rawToDoFromStorage = mockStorage[testToDoID];
        expect(rawToDoFromStorage).toBeDefined();

        const parsedToDo = JSON.parse(rawToDoFromStorage);

        // check if the deadline was persisted in storage
        const savedToDoTimestamp = new Date(parsedToDo.dueDate).getTime();
        expect(savedToDoTimestamp).toBe(new Date(futureDeadline).getTime());
        
    })

    it("should cascade delete a project and its associated todos", () => {
        // 1. Arrange:
        const pName = "Delete Cascade Project";
        const cascadeProject = new Project({ name: pName });
        const cascadeTodo = new ToDo({ id: "cascade-todo-123", title: "I will die" });

        cascadeProject.addToDo(cascadeTodo.id)

        // Persist
        cascadeProject.saveToStorage();
        cascadeTodo.saveToStorage();

        // 2. Act: Delete project
        const result = Project.delete(pName, true);
        expect(result).toBe(0);

        // 3. Assert: Check if all is gone from mockStorage
        expect(mockStorage[pName]).toBeUndefined();
        expect(mockStorage[cascadeTodo.id]).toBeUndefined();

        // 4. Assert: Check, if items also removed from cache
        // cache is NOT being manually cleared, to make sure
        // it has been cleared by Project.delete()
        expect(Project.fromStorage(pName)).toBeNull();
        expect(ToDo.fromStorage(cascadeTodo.id)).toBeNull();
    })

    it("should delete the project, but keep associated todos when cascadeMode = false", () => {
        // 1. Arrange
        const pName = "Orphan Test Project";
        const orphanProject = new Project({ name: pName });
        const orphanTodo = new ToDo({ id: "orphan-todo-999", title: "I will survive", project: pName });

        orphanProject.addToDo(orphanTodo.id);

        // persist
        orphanProject.saveToStorage();
        orphanTodo.saveToStorage();

        // 2. Act: Delete project with cascadeMode = false
        const result = Project.delete(pName);
        expect(result).toBe(0);

        // 3. Assert: The result must be removed from Storage
        expect(mockStorage[pName]).toBeUndefined();

        // 4. Assert: The ToDo musst still exist in storage
        expect(mockStorage[orphanTodo.id]).toBeDefined();

        // clear cache to freshly de-serialize ToDo from mockStorage
        ToDo.clearCache();
        Project.clearCache();

        // 5. Assert: Re-load the ToDo and check if project property is set to null
        const reloadedTodo = ToDo.fromStorage("orphan-todo-999");
        expect(reloadedTodo).not.toBeNull();
        expect(reloadedTodo.project).toBeNull();
    })

    afterAll(() => {
        // log new project class instance for inspection
        console.log(proj);

    })

})

