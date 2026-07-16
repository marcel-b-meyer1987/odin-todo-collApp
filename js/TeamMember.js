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

    addProject(project) {
        // if the project is not already in the project list of the team member, add it and return 0 as success code
        // if project was already in the list, return 1 as error code

        if (this.projects.indexOf(project) < 0) {
            this.projects.push(project);
            return 0;
        } else {
            return 1;
        }
    }
}