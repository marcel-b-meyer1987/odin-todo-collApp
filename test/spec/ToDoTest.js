import { ToDo } from "../../js/ToDo.js";

describe("ToDo class test suite", () => {
    
    // Setup
        const parentToDo = new ToDo({title: "Parent-ToDo"});
        parentToDo.saveToStorage();

        const anotherParent = new ToDo({title: "Another Parent"});
        anotherParent.saveToStorage();            

        const toDo = new ToDo({
            title: "Test-ToDo",
            notes: "this is a basic test todo",
            parentID: parentToDo.id,
        });
        toDo.saveToStorage();
        
        const saved = ToDo.fromStorage(toDo.id);
        
        console.log("created freshly:", toDo);
        console.log("loaded from storage:", saved);
        
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
        const parent = toDo.getParent();
        expect(parent instanceof ToDo).toBe(true);
        console.log(parent);
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
    
    
    afterAll(() => {
        window.localStorage.clear();
    })

});

// DIETER

// ROBERT MEYER