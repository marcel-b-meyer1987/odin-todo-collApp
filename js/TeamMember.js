export class TeamMember {
    
    constructor(name) {
        this.name = name;
        this.registrationTimestamp = Date.now();
        this.categories = [];
        this.projects = [];
        this.toDos = [];
    }

    assignToDo(todo) {

        // if the todo is not already in the ToDo list of the team member, add it and return 0 as success code
        // if todo was already in the ToDo-List of the team member, return 1 as error code

        if (this.toDos.indexOf(todo) < 0) {
            this.toDos.push(todo);
            return 0;
        } else {
            return 1;
        }
    }

    unassignToDo(todo) {
        const index = this.toDos.indexOf(todo);

        // if todo is not assigned (anymore), return 1 (error),
        // otherwise remove from array + return 0 (success)
        if (index < 0) return 1;

        this.toDos.splice(index, 1);
        return 0;
    }

    addCategory(category) {
        // if the category is not already in the category list of the team member, add it and return 0 as success code
        // if category was already in the list, return 1 as error code

        if (this.categories.indexOf(category) < 0) {
            this.categories.push(category);
            return 0;
        } else {
            return 1;
        }
    }

    removeCategory(category) {
        const index = this.categories.indexOf(category);

        // if category is not in list (anymore), return 1 (error),
        // otherwise remove from array + return 0 (success)
        if (index < 0) return 1;

        this.categories.splice(index, 1);
        return 0;
    }

    addToProject(project) {
        // if the project is not already in the project list of the team member, add it and return 0 as success code
        // if project was already in the list, return 1 as error code

        if (this.projects.indexOf(project) < 0) {
            this.projects.push(project);
            return 0;
        } else {
            return 1;
        }
    }

    removeFromProject(project) {
        const index = this.projects.indexOf(project);

        // if project is not assigned (anymore), return 1 (error),
        // otherwise remove from array + return 0 (success)
        if (index < 0) return 1;

        this.projects.splice(index, 1);
        return 0;
    }
}