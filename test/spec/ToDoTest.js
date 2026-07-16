import { ToDo } from "../../js/todo.js";

describe("ToDo class test suite", () => {

    // Setup
        const toDo = new ToDo({
            title: "Test-ToDo",
            notes: "this is a basic test todo"
        });

        toDo.saveToStorage();
        const saved = ToDo.fromStorage(toDo.id);
        
        console.log("created freshly:", toDo);
        console.log("loaded from storage:", saved);

    it("should instantiate an object of the ToDo class", () => {
        expect(toDo).toBeInstanceOf(ToDo);
    });

    it("should have an ID even if not passed for the constructor", () => {
        expect(toDo.id).not.toBe(null);
    })

    it("should have the correct title", () => {
        expect(toDo.title).toBe("Test-ToDo");
    });

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

});