import { TODO_STATUS, TODO_PRIO } from "./const.js";
import { Project } from "./Project.js";
import { DB_Handler } from "./DB_Handler.js";

export class ToDo {

	// cache for all todos used by the app
	static #cache = new Map();

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
		this.categories = categories || ["Uncategorized"];
		this.assignedTo  = assignedTo || undefined;
		this.prio = prio || TODO_PRIO.NORMAL;
		this.customSortNo = customSortNo || undefined;
		this.trashBinDate = trashBinDate || undefined; // needed to calculate the day that the Todo will be deleted from trash for good / default undefined means: not recycled 
		this.parentID = parentID || null;
		this.DB_Handler = 
		
		ToDo.#cache.set(this.id, this);
	}
	
	saveToStorage() {

		// save to localStorage (later: IndexedDB)
		DB_Handler.saveItem(`${this.id}`, JSON.stringify(this));
	}

	static exists(todoID) {
		// check if todo exists in the data layer
		// return true or false accordingly

		if (! localStorage.getItem(todoID)) {
			return false;
		}
		else {
			return true;
		} 
	}

	static isCached(todoID) {
		return ToDo.#cache.has(todoID);
	}

	static clearCache() {
		ToDo.#cache.clear();
	}

	static fromStorage(todoID) {
		
		// if no ID was passed in, return null
		if (!todoID) return null;

		// if todo is already cached, retrieve from cache
		if (ToDo.isCached(todoID)) return ToDo.#cache.get(todoID);

		// if not cached, return from data layer
		const data = DB_Handler.getItem(todoID);


		// if todo id not found, return early + print warning
		if (!data) {
			console.warn(`ToDo with id ${todoID} not found.`);
			return null;
		}

		console.log("Raw data:", data);
		console.log("Parsed data:", JSON.parse(data));

		try {
			const parsed = JSON.parse(data);
			const id = parsed.id;
			
			// load todo with todoID from localStorage (later: IndexedDB)
			const {	title,
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
					trashBinDate
				} = parsed;

			// create a new ToDo instance with the data from storage
			return new ToDo({	id,
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
								trashBinDate
							});
		} 
		catch(error) {
			console.error(error);
			return null;
		}
		
	}

	setTitle(newTitle) {
		// check if newTitle is not an empty string
		// if NOT - set newTitle + return 0 (success)
		// if YES - return early with exit code 1 (error)
		if (! newTitle.trim().length > 0) return 1;

		this.title = newTitle.trim();
		return 0;
	}
	
	setDeadline(newDate) {
		// if deadline is still (or currently) undefined, assign it to a new Date object
        if (! this.dueDate) this.dueDate = new Date();

        // check if newDate < now 
        // if YES: return early w/ exit code 1 (error)
        // if NOT: set dueDate to newDate + return w/ exit code 0 (success)

        if (newDate < Date.now()) {
            return 1;
        } else {
            this.dueDate.setTime(newDate);
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
		return 0;
	}

	getParent() {
		// returns either null (if parentID invalid) or the parent ToDo O
		return (ToDo.fromStorage(this.parentID));
	}

	detachFromParent() {
		this.parentID = null;
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
		while (currentParent) {

			// make sure the parent is not in the array already to precent circular reference
			if (visitedIDs.has(currentParent.id)) {
				console.error(`Circular reference detected for ToDo ID: ${currentParent.id}`);
				break;
			}
			visitedIDs.add(currentParent.id);

			hierarchy.unshift(currentParent);
			currentParent = currentParent.getParent();
		}
		
		// build + return path object from the components above
		return {
			categories: this.categories || [],
			hierarchy: hierarchy
		};
		
	}
}


 