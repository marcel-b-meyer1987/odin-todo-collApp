import { Project } from "../../js/Project.js";
import { ToDo } from "../../js/ToDo.js";

describe("Project class test suite", () => {

    let todo0;
    let todo1;
    let proj;
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
        expect(proj.toDos.indexOf(todo1) < 0).toBe(true);
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

    it("should have a cache", () => {
        expect(Project.#cache).not.toBe(null);
    })  

    afterAll(() => {
        // log new project class instance for inspection
        console.log(proj);

    })

})

// manual testing:
