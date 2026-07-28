import { ToDo } from "../../js/ToDo.js";
import { Project } from "../../js/Project.js";
import { DB_Handler } from "../../js/DB_Handler.js";
import { APP_CONST, TODO_STATUS } from "../../js/const.js";

describe("ToDo class test suite", () => {
    
    // Setup
    let mockStorage = {};

    const parentToDo = new ToDo({ id: "parent-1", title: "Parent-ToDo"});
    const anotherParent = new ToDo({ id: "parent-2", title: "Another Parent"});
    const toDo = new ToDo({
        id: "toDo-1",
        title: "Test-ToDo",
        notes: "this is a basic test todo",
        parentID: parentToDo.id,
    });
    
    const saved = ToDo.fromStorage(toDo.id);
    
    // console.log("created freshly:", toDo);
    // console.log("loaded from storage:", saved);
        
    it("should be able to be attached to a parent", () => {
        toDo.parentID = null; // reset
        toDo.setParent(parentToDo.id);
        // expect(toDo.parentID != null).toBe(true);
        expect(toDo.parentID).toBe(parentToDo.id);
    })

    it("should not overwrite a parentID with another one", () => {
        let exitCode = toDo.setParent(anotherParent.id);
        expect(toDo.parentID).toBe(parentToDo.id);
        expect(exitCode).toBe(1);
    })

    it("should instantiate an object of the ToDo class", () => {
        expect(toDo).toBeInstanceOf(ToDo);
    });

    it("should have an ID even if not passed for the constructor", () => {
        expect(toDo.id).not.toBe(null);
    })

    it("should have the correct notes", () => {
        expect(toDo.notes).toBe("this is a basic test todo");
    });

    it("should save to storage", () => {
        expect(ToDo.fromStorage(toDo.id)).not.toBe(undefined);
    });

    it("should re-instantiate saved objects from storage as class instances", () => {
        expect(saved).toBeInstanceOf(ToDo);
    })

    it("should be able to set a due date", () => {
        expect(saved.setDeadline(Date.now())).toBe(0);
    })

    it("should be able to set a new title", () => {
        toDo.setTitle("New ToDo Title");
        expect(toDo.title).toBe("New ToDo Title");
    })

    it("should not set an empty string as new title", () => {
        expect(toDo.setTitle("")).toBe(1);
    })

    it("can check if a ToDo item exists in the storage", () => {
        expect(ToDo.exists(toDo.id)).toBe(true);
        expect(ToDo.exists("safafsdasdfadf")).toBe(false);
    })
    
    it("can get its parent instance from storage", () => {
        const loadedParent = toDo.getParent();
        expect(loadedParent.id).toBe("parent-1");
        // console.log(parent);
    })    
    
    it("can build a path object", ()=> {
        // 1. Arrange
        const parentTodo = new ToDo({ id: "parent-1", title: "Parent Task"});
        const childTodo = new ToDo({ id: "child-1", title: "Child Task", parentID: "parent-1"});

        parentTodo.saveToStorage();
        childTodo.saveToStorage();

        // clear cache to force re-loading via getParent instead
        ToDo.clearCache();

        // 2. Act
        const loadedChild = ToDo.fromStorage("child-1");
        const pathObject = loadedChild.buildPathObject();

        // 3. Assert
        expect(pathObject.hierarchy.length).toBe(2);
        expect(pathObject.hierarchy[0].id).toBe("parent-1");
        expect(pathObject.hierarchy[1].id).toBe("child-1");
    })

    it("should remove itself from its project and delete all child todos recursively before deleting itself", () => {
        // 1. Arrange: Create a project, a todo within it + a child todo
        const pName = "ToDo Deletion Project";
        const testProject = new Project({ name: pName });
        const mainTodo = new ToDo({ id: "main-1", title: "Main Task", project: pName });
        const subTodo = new ToDo({ id: "sub-1", title: "Sub Task", parentID: "main-1" });

        // Make connections
        testProject.addToDo(mainTodo.id);

        // persist all objects + register in cache
        [testProject, mainTodo, subTodo].forEach(obj => obj.saveToStorage());

        // 2. Act: Delete main todo
        const result = ToDo.delete("main-1");
        expect(result).toBe(0);

        // 3. Assert: Main todo and sub todo must be deleted completely
        expect(ToDo.fromStorage("main-1")).toBeNull();
        expect(ToDo.fromStorage("sub-1")).toBeNull();

        // empty both caches in order to check state freshly off storage
        Project.clearCache();
        ToDo.clearCache();

        // 4. Assert: Check if project was refreshed and doesn't contain the todo anymore
        const reloadedProject = Project.fromStorage(pName);
        expect(reloadedProject).not.toBeNull();
        expect(reloadedProject.toDos).not.toContain("main-1"); // ID was removed


    })
    
    it("should move a ToDo to trash and delete it when emptyTrash() is called after expiration date ", () => {
        // 1. Arrange: create 2 todos
        const t1 = new ToDo({ id: "trash-1", title: "Expired ToDo" });
        const t2 = new ToDo({ id: "trash-2", title: "Fresh ToDo" });

        t1.moveToTrash();
        t2.moveToTrash();

        // manipulate the trashBinDate of t1 to the past
        t1.trashBinDate = Date.now() - 5000;
        t1.saveToStorage();

        // 2. Act: empty trash bin
        const deletedAmount = ToDo.emptyTrash();

        // 3. Assert: exactly 1 ToDo should have been deleted
        expect(deletedAmount).toBe(1);

        // the expired ToDo musst be removed from storage
        expect(ToDo.fromStorage("trash-1")).toBeNull();

        // the fresh ToDo musst still be there, as it will only expire 30 days from now
        expect(ToDo.fromStorage("trash-2")).not.toBeNull();

        // clean-up of the 2nd todo for following tests
        ToDo.delete("trash-2");
    })

    it("should automatically maintain the global ToDo ID index in storage", () => {
        // 1. Arrange: get storage key from const.js
        let key = APP_CONST.STORAGE_KEYS.PREFIX; 
            key += APP_CONST.STORAGE_KEYS.USER; // may be change to user ID or some such later in multi-user version
            key += APP_CONST.STORAGE_KEYS.TODOS;
        
        // 2. Act: Create a new ToDo (triggering constructor)
        const trackedToDo = new ToDo({ id: "tracked-123", title: "Index Test Task" });

        // 3. Assert: Check if global index contains the id 
        let currentIndex = ToDo.getGlobalIndex();
        expect(currentIndex).toContain("tracked-123");

        // 4. Act: Delete ToDo for good
        ToDo.delete("tracked-123");

        // 4. Assert: Make sure the ID has been removed from the global index properly
        let updatedIndex = ToDo.getGlobalIndex();
        expect(updatedIndex).not.toContain("tracked-123");

    })

    it("should maintain a tree structure of sub-tasks and correctly calculate checklist progress", () => {
        // 1. Arrange: create main todo + 2 sub-todos
        const main = new ToDo({ id: "main-task", title: "Main Project Goal" });
        const sub1 = new ToDo({ id: "sub-task-1", title: "First milestone" });
        const sub2 = new ToDo({ id: "sub-task-2", title: "Second milestone" });
        
        main.saveToStorage();
        sub1.saveToStorage();
        sub2.saveToStorage();

        // 2. Act: act sub todos to main todo
        main.addSubTask(sub1.id);
        main.addSubTask(sub2.id);

        // 3. Assert: Check bidirectional link in RAM
        expect(main.checklist).toContain("sub-task-1");
        expect(sub1.parentID).toBe("main-task");

        // 4. Assert: since no sub todo is done yet, progress should be 0
        expect(main.getChecklistProgress()).toBe(0);

        // 5. Act: Set 1st sub task to DONE
        sub1.status = TODO_STATUS.DONE;
        sub1.saveToStorage();

        // 6. Assert: Progress should now be 50 (1/2 DONE)
        expect(main.getChecklistProgress()).toBe(50);
    });

    it("should detect redundant sub-task titles within the same task checklist", () => {
        // 1. Arrange: Create a main todo and "existing" sub todo
        const mainTask = new ToDo({ id: "parent-root", title: "Einkaufsliste" });
        const existingSub = new ToDo({ id: "child-exist", title: "Frische Milch kaufen" });
        
        mainTask.saveToStorage();
        existingSub.saveToStorage();
        mainTask.addSubTask(existingSub.id);

        // 2. Act & Assert: Check a very similar title (redundancy should be detected)
        const redundantTitle = "Milch einkaufen";
        const warningResult = mainTask.checkForRedundancy(redundantTitle);
        
        expect(warningResult).not.toBeNull();
        if (warningResult) {
            expect(warningResult.title).toBe("Frische Milch kaufen"); // shows the duplicate title
        }

        // 3. Act & Assert: Check a completely different title (should return null = no problem)
        const safeTitle = "Brot backen";
        const safeResult = mainTask.checkForRedundancy(safeTitle);
        expect(safeResult).toBeNull();
    });

    it("should correctly handle German umlauts in string similarity", () => {
        const sim = ToDo.calculateStringSimilarity("Büro aufräumen", "Buero aufraeumen");
        // should report high similarity, despite spelling with umlauts
        expect(sim).toBeGreaterThan(0.5); 
    });
    
    afterAll(() => {
        window.localStorage.clear();
    })

});

// DIETER

// ROBERT MEYER