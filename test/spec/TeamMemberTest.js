import { TeamMember } from "../../js/TeamMember.js";
import { ToDo } from "../../js/ToDo.js";
import { DB_Handler } from "../../js/DB_Handler.js";
import { APP_CONST } from "../../js/const.js";

describe("TeamMember class test suite", () => {
    let mockStorage;
    const teamKey = APP_CONST.STORAGE_KEYS.TEAM;

    beforeEach(() => {
        // fresh, empty mock storage before every single test case
        mockStorage = {};

        // register mocks for DB_Handler
        spyOn(DB_Handler, 'saveItem').and.callFake((key, value) => {
            mockStorage[key] = String(value);
        });

        spyOn(DB_Handler, 'getItem').and.callFake((key) => {
            return mockStorage[key] || null;
        });

        spyOn(DB_Handler, 'removeItem').and.callFake((key) => {
            delete mockStorage[key];
        });

        // ensure empty caches before each test
        TeamMember.clearCache();
        ToDo.clearCache();
    });

    it("should automatically save, cache, and index a new member on creation", () => {
        // Act: Instantiate new member 
        const member = new TeamMember("John Doe");

        // Assert 1: The object was stored in DB with its ID as key
        expect(mockStorage[member.id]).toBeDefined();

        // Assert 2: The ID was added to the global index
        const globalIndex = JSON.parse(mockStorage[teamKey]);
        expect(globalIndex).toContain(member.id);

        // Assert 3: Team member is loaded directly from cache (without DB storage)
        const savedDataBackup = mockStorage[member.id];
        delete mockStorage[member.id]; // temporarily remove from storage
        const cachedMember = TeamMember.fromStorage(member.id);
        expect(cachedMember).toBe(member); 
        mockStorage[member.id] = savedDataBackup; // put it back into storage
    });

    it("should handle team members with duplicate names uniquely via distinct IDs", () => {
        // Act: Create two members with identical names
        const member1 = new TeamMember("Alice");
        const member2 = new TeamMember("Alice");

        // Assert: The IDs must be different
        expect(member1.id).not.toEqual(member2.id);

        // both IDs must be contained within the global index independently
        const globalIndex = JSON.parse(mockStorage[teamKey]);
        expect(globalIndex).toContain(member1.id);
        expect(globalIndex).toContain(member2.id);
        expect(globalIndex.length).toBe(2);
    });

    it("should successfully assign and unassign ToDo IDs", () => {
        const member = new TeamMember("Bob");
        const todoId = "todo-xyz-123";

        // 1. check assignment
        expect(member.assignToDo(todoId)).toBe(0);
        expect(member.toDos).toContain(todoId);

        // duplicate assignment should fail (Exit-Code 1)
        expect(member.assignToDo(todoId)).toBe(1);

        // 2. check unassignment
        expect(member.unassignToDo(todoId)).toBe(0);
        expect(member.toDos).not.toContain(todoId);

        // 2nd try to unassign should fail
        expect(member.unassignToDo(todoId)).toBe(1);
    });

    it("should correctly manage project assignments by name", () => {
        const member = new TeamMember("Charlie");
        const pName = "Project Apollo";

        // 1. add to project
        expect(member.addToProject(pName)).toBe(0);
        expect(member.projects).toContain(pName);

        // duplicate adding should fail
        expect(member.addToProject(pName)).toBe(1);

        // 2. remove from project
        expect(member.removeFromProject(pName)).toBe(0);
        expect(member.projects).not.toContain(pName);
    });

    it("should decouple assigned ToDos when a team member is deleted (Inbox-Principle)", () => {
        // Arrange: create member and a fresh, unassigne ToDo
        const member = new TeamMember("Müller");
        const testTodo = new ToDo({ id: "work-task-1", title: "Important Report" });
        testTodo.saveToStorage();

        // Act 1: Assign ToDo to the member
        member.assignToDo(testTodo.id);

        // check if bidirectional link worked in RAM 
        expect(testTodo.assignedTo).toBe(member.id);

        // Act 2: remove team member for good
        const result = TeamMember.delete(member.id);
        expect(result).toBe(0);

        // Assert 1: Member removed from storage + index
        expect(mockStorage[member.id]).toBeUndefined();
        expect(JSON.parse(mockStorage[teamKey])).not.toContain(member.id);

        // empty cache to test the state of the ToDo from storage
        TeamMember.clearCache();
        ToDo.clearCache();

        // Assert 2: ToDo still exists, but the assignment has been reset by the deletion
        const reloadedTodo = ToDo.fromStorage("work-task-1");
        expect(reloadedTodo).not.toBeNull();
        expect(reloadedTodo.assignedTo).toBeUndefined();
    });
});
