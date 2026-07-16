export class Project {
    
    constructor(projectName) {
        this.name = projectName;
        this.creationTimestamp = Date.now();
        this.deadline = new Date();
        this.toDos = [];
    }

}