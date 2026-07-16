
// DIETER 

export class Project {
    
    constructor(projectName) {
        this.name = projectName;
        this.creationTimestamp = Date.now();
        this.deadline = undefined; // default value = no deadline at all
        this.toDos = [];
    }


    changeName(newName) {

        // if the new name is no empty string, change it and return 0 (success)
        // otherwise, return 1 (error)
        if (newName.trim() != "") {
            this.name = newName;
            return 0;
        } else {
            return 1;
        }
    }

    addToDo(todo) {

        const index = this.toDos.indexOf(todo);
        
        // if the ToDo is already in the list, return early with exit code 1 (error),
        // otherwise add it to the list and return 0 (success)
        if (index >= 0) {
            return 1;
        } else {
            this.toDos.push(todo);
            return 0;
        }

    }

    removeToDo(todo) {
        const index = this.toDos.indexOf(todo);

        // if the todo is not in the list, return early with exit code 1 (error),
        // otherwise remove it from the list and return with exit code 0 (success)
        if (index < 0) return 1;

        this.toDos.splice(index, 1);
        return 0;
    }

    setDeadline(newDate, affectToDos = false) {
        // the affectToDos parameter is a boolean which, if set to true,
        // works as a flag to take over the deadlines for each ToDo in the project 

        // if deadline is still (or currently) undefined, assign it to a new Date object
        if (! this.deadline) this.deadline = new Date();

        // check if newDate < now 
        // if YES: return early w/ exit code 1 (error)
        // if NOT: set Dealine to newDate + return w/ exit code 0 (success)
        const now = Date.now();

        if (newDate < now) {
            return 1;
        } else {
            this.deadline.setTime(newDate);

            // if ToDos should be affected by the new deadline, set this here
            if (affectToDos) {
                this.toDos.forEach(todo => todo.setDeadline(newDate));
            }

            return 0;
        }

    }

    removeDeadline() {
        // remove the deadline from the project altogether
        // by re-setting it to undefined
        this.deadline = undefined;
    }

}