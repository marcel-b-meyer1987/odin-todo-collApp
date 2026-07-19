export class DB_Handler {
    constructor() {
        
    }

    static getItem(id) {
        // if no ID was passed, print error + return null
        if (!id) {
            console.error("Error: DB_Handler.getItem() requires an item as 1st argument. Cannot get Item without ID.");
            return null;
        }

        // else, return the item, based on the ID
        // currently from localStorage => should later be changed to IndexedDB
        return localStorage.getItem(id);
    }

    static saveItem(key, value) {

        // save the item to localStorage
        // should later be chaged to IndexedDB or another DB solution
        try {
            localStorage.setItem(key, value);
        } 
        catch(error) {
            console.error(error);
        }
    }
}