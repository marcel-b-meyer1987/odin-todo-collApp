import { TODO_STATUS, TODO_PRIO, APP_CONST } from "./const.js";
import { Project } from "./Project.js";
import { DB_Handler } from "./DB_Handler.js";

export class ToDo {

	// cache for all todos used by the app
	static #cache = new Map();

	static #indexKey =  APP_CONST.STORAGE_KEYS.PREFIX +
						APP_CONST.STORAGE_KEYS.USER +
						APP_CONST.STORAGE_KEYS.TODOS;

	constructor({
		id,
		title,
		notes,
		createdDate,
		dueDate,
		parentID,
		checklist,
		status,
		project,
		categories,
		assignedTo,
		prio,
		customSortNo,
		trashBinDate,
	}) {
		this.id = id || crypto.randomUUID();
		this.title = title || "New ToDo";
		this.notes = notes || "";
		this.createdDate = createdDate || Date.now();
		this.dueDate = dueDate || undefined; // default = undefinde (no deadline at all)
		this.checklist = checklist || [];
		this.status = status || TODO_STATUS.PENDING;
		this.project = project || null;
		this.categories = categories && categories.length > 0 ? categories : ["Uncategorized"];
		this.assignedTo  = assignedTo || undefined;
		this.prio = prio || TODO_PRIO.NORMAL;
		this.customSortNo = customSortNo || undefined;
		this.trashBinDate = trashBinDate || undefined; // needed to calculate the day that the Todo will be deleted from trash for good / default undefined means: not recycled 
		this.parentID = parentID || null;
		
		ToDo.#cache.set(this.id, this);
		ToDo.#addToGlobalIndex(this.id);
		this.saveToStorage();
	}
	
	saveToStorage() {

		// save to localStorage (later: IndexedDB)
		DB_Handler.saveItem(`${this.id}`, JSON.stringify(this));

		// update in cache, too, to keep data consistent
		ToDo.#cache.set(this.id, this);
	}

	static exists(todoID) {
		// check if todo exists in the data layer
		// return true or false accordingly

		if (! DB_Handler.getItem(todoID)) {
			return false;
		}
		else {
			return true;
		} 
	}

	static getAllChildren(parentID) {
		// Helper method: Finds all ToDos in the system having this ToDo as parent

		const children = [...ToDo.#cache.values()].filter(todo => todo.parentID === parentID);

		return children;
	}

	static isCached(todoID) {
		return ToDo.#cache.has(todoID);
	}

	static clearCache() {
		ToDo.#cache.clear();
	}

	static clearSingleCacheItem(todoID) {
		if (!todoID) return 1; // error
		ToDo.#cache.delete(todoID);
		return 0; // success
	}

	static fromStorage(todoID) {
		
		// if no ID was passed in, return null
		if (!todoID) return null;

		// if todo is already cached, retrieve from cache
		if (ToDo.isCached(todoID)) return ToDo.#cache.get(todoID);

		// if not cached, return from data layer
		const data = DB_Handler.getItem(todoID);

		// if todo id not found in storage either, return early + print warning
		if (!data) {
			console.warn(`ToDo with id ${todoID} not found.`);
			return null;
		}

		try {
			// create a new ToDo instance with the data from storage
			const parsed = JSON.parse(data);
			return new ToDo(parsed);
		} 
		catch(error) {
			console.error(error);
			return null;
		}
		
	}

	static delete(todoID) {
		if (!todoID) return 1;

		// get todo from storage
		const todoToDelete = ToDo.fromStorage(todoID);
		if (!todoToDelete) {
			console.warn(`Todo with ID ${todoID} not found for deletion.`);
			return 1;
		}

		// project clean-up: If todo is associated to project, remove it from the project
		if(todoToDelete.project) {
			const associatedProject = Project.fromStorage(todoToDelete.project);
			if (associatedProject) {
				associatedProject.removeToDo(todoID); // will call saveToStorage() on the project internally
			}
		}

		// remove all child todos
		const childToDos = ToDo.getAllChildren(todoID);
		childToDos.forEach(child => {
			ToDo.delete(child.id); // recursive method call for each child todo
		})

		// remove the todoID from the global index of todo IDs
		ToDo.#removeFromGlobalIndex(todoID);

		// finally, remove ToDo itself from storage + cache
		DB_Handler.removeItem(todoID);
		ToDo.clearSingleCacheItem(todoID);

		return 0; // success

	}

	static getGlobalIndex() {
        const data = DB_Handler.getItem(ToDo.#indexKey);
		return data ? JSON.parse(data) : [];
	}

	static #addToGlobalIndex(todoID) {
		const index = ToDo.getGlobalIndex();
		if (!index.includes(todoID)) {
			index.push(todoID);
			DB_Handler.saveItem(ToDo.#indexKey, JSON.stringify(index));
		}
	}

	static #removeFromGlobalIndex(todoID) {
		let index = ToDo.getGlobalIndex();
		index = index.filter(id => id !== todoID);
		DB_Handler.saveItem(ToDo.#indexKey, JSON.stringify(index));
	
	}

	setTitle(newTitle) {
		// check if newTitle is not an empty string
		// if NOT - set newTitle + return 0 (success)
		// if YES - return early with exit code 1 (error)
		if (! (newTitle.trim().length > 0)) return 1;

		this.title = newTitle.trim();
		this.saveToStorage();
		return 0;
	}
	
	setDeadline(newDate) {
		// if deadline is still (or currently) undefined, assign it to a new Date object
        if (! this.dueDate) this.dueDate = new Date();

        // check if newDate < now 
        // if YES: return early w/ exit code 1 (error)
        // if NOT: set dueDate to newDate + return w/ exit code 0 (success)

        if (newDate < (Date.now() - 1000)) { // taking into account 1000ms of time buffer on top to make up for latency in unit tests
            return 1;
        } else {
            this.dueDate.setTime(newDate);
			this.saveToStorage();
            return 0;
        }
	}

	setParent(parentID) {

		// validate if parentID is a valid todoID from the app
		if (! ToDo.exists(parentID)) {
			console.error(`Could not attachach to parent ToDo. ToDo ID ${parentID} not existing in storage.`);
			return 1;
		}
		
		// check if the todo isn't already assigned to another parent
		if (this.parentID != null) {
			console.error(`
				Attaching to parent failed. 
				Cannot assign a single ToDo to more than one parent.
				ToDo is already attached to ToDo ID ${this.parentID}`);
			return 1;
			}
			
		// if both OK, set parentID to parentID and return 0 (success)
		this.parentID = parentID;
		this.saveToStorage();
		return 0;
	}

	getParent() {
		// returns either null (if parentID invalid) or the parent ToDo
		return (ToDo.fromStorage(this.parentID));
	}

	detachFromParent() {
		this.parentID = null;
		this.saveToStorage();
	}

	buildPathObject() {
		// the method returns an object which is used by the UI_Manager
		// to build a display of the full path of any ToDo with the
		// name of each parent ToDo in the path + the cagetory,
		// while each element in the path should be clickable and 
		// open the respective parent element (or category) when clicked
		// for this purpose, the object consists of:
		//
		// path.category = the categori(es) of the current ToDo OR "Uncategorized"
		// path.hierarchy = an array of the parents + the current ToDo as last element
		//
		// example: "/uncategorized/parent_1/.../parent_n/current_todo"
		
		// =============================================================
		// loop over parents recursively from parent_1 to parent_n,
		// add each parent to the front of the hierarchy array
		// in order to replicate the hierarchy level in the array depth
		
		const hierarchy = [this]; // initialize array with current todo
		let currentParent = this.getParent();

		// use a set to detect circular references
		const visitedIDs = new Set([this.id]);

		//THIS PART OF LOGIC CREATES FREEZE / CRASH => ENDLESS LOOP?
		while (currentParent && currentParent.id) {

			// make sure the parent is not in the array already to precent circular reference
			if (visitedIDs.has(currentParent.id)) {
				console.error(`Circular reference detected for ToDo ID: ${currentParent.id}`);
				break;
			}
			visitedIDs.add(currentParent.id);
			hierarchy.unshift(currentParent);

			// if parentID is null or empty, break loop immediately
			if (! currentParent.parentID) break;

			currentParent = currentParent.getParent();
		}
		
		// build + return path object from the components above
		return {
			categories: this.categories || [],
			hierarchy: hierarchy
		};
		
	}

	moveToTrash() {
		// calculate deletion date: Now + default preserve duration in ms
		const preserveDurationInMs = APP_CONST.DEFAULT_SETTINGS.TRASH_BIN_DEFAULT_PRESERVE_DURATION * 24 * 60 * 60 * 1000;
		this.trashBinDate = Date.now() + preserveDurationInMs;

		// change status of ToDo
		this.status = TODO_STATUS.TRASH_BIN;

		this.saveToStorage();
	}

	restoreFromTrash() {
		// reset trashBinDate to undefined + status to normal
		this.trashBinDate = undefined;
		this.status = TODO_STATUS.PENDING;

		this.saveToStorage();
	}

	static emptyTrash() {
		const now = Date.now();
		let deletedCount = 0;

		// get all todos from the cache => may need to be refactored (what if the user just started the app and cache is empty?)
		const allTodos = [...ToDo.#cache.values()];

		allTodos.forEach(todo => {
			if(todo.trashBinDate && todo.trashBinDate <= now) {
				ToDo.delete(todo.id);
				deletedCount++;
			}
		});

		return deletedCount; // contrary to the rest of the codebase, deviating from 0 does not mean an error in this method
	}
}


 