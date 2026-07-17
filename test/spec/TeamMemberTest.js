import { TeamMember } from "../../js/TeamMember.js";
import { ToDo } from "../../js/ToDo.js";
import { Project } from "../../js/Project.js";

describe("TeamMember class test suite", () => {

    // Setup
    let user1;
    
    let toDo0;
    let toDo1;

    let category0;
    let category1;

    let project0;
    let project1;

    beforeAll(() => {
        toDo0 = new ToDo({title: "Altes ToDo"});
        toDo1 = new ToDo({title: "TÜV-Liste an Jürgen schicken"});
        category0 = "Instandhaltung";
        category1 = "Rückladungen";
        project0 = new Project("Haustarif Stückgut");
        project1 = new Project("Neues Project");
        user1 = new TeamMember("Marcel");
        user1.assignToDo(toDo0);
        user1.addCategory(category0);
        user1.addToProject(project0);
    })

    // Tests
    it("should instantiate an object of the TeamMember class", ()=> {
        expect(user1 instanceof TeamMember).toBe(true);
    })

    it("should be able to assign new ToDos to the TeamMember", () => {
        user1.assignToDo(toDo1);
        expect(user1.toDos.indexOf(toDo1) >= 0).toBe(true);
    })

    it("should not assign the same ToDo more than once", () => {
        expect(user1.assignToDo(toDo0)).toBe(1);
    })

    it("should be able to assign new categories to the Team Member", () => {
        user1.addCategory(category1);
        expect(user1.categories.indexOf(category1) >= 0).toBe(true);
    })

    it("should not assign the same category more than once", () => {
        expect(user1.addCategory(category0)).toBe(1);
    })

    it("should be able to add new projects to the team member's project list", () => {
        user1.addToProject(project1);
        expect(user1.projects.indexOf(project1) >= 0).toBe(true);
    })

    it("should not add the same project to the member's project list more than once", () => {
        expect(user1.addToProject(project0)).toBe(1);
    })

    it("should unassign ToDos from the user", () => {
        user1.assignToDo(toDo1);
        user1.unassignToDo(toDo1);
        expect(user1.toDos.indexOf(toDo1) < 0).toBe(true);
    })

    it("should be able to remove categories from the team member's list", () => {
        const cat = "Test category";
        user1.addCategory(cat);
        user1.removeCategory(cat);
        expect(user1.categories.indexOf(cat) < 0).toBe(true);
    })

    it("should be able to remove the user from a project", () => {
        const proj = project1;
        user1.addToProject(proj);
        user1.removeFromProject(proj);
        expect(user1.projects.indexOf(proj) < 0).toBe(true);
    })

    // log Team Member class instance for inspection
    afterAll(() => {
        console.log(user1);
    })

});