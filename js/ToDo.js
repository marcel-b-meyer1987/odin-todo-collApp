import { TODO_STATUS, TODO_PRIO, APP_CONST, UI_CONST } from "./const.js";
import { Project } from "./Project.js";
import { DB_Handler } from "./DB_Handler.js";
import { ProgressEntry } from "./ProgressEntry.js";

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
		completedDate,
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
		this.completedDate = completedDate || undefined; // default = undefinded (still pending)
		this.checklist = checklist || [];
		this.status = status ?? TODO_STATUS.PENDING;
		this.project = project || null;
		this.categories = categories && categories.length > 0 ? categories : [APP_CONST.DEFAULT_SETTINGS.NO_CAT_STD_LABEL];
		this.assignedTo  = assignedTo || undefined;
		this.prio = prio ?? TODO_PRIO.NORMAL;
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

		// if ToDo is marked as done and assigned to a team member,
		// update the team member's progress statistics
		if (this.status === TODO_STATUS.DONE && this.assignedTo) {
			ProgressEntry.updateProgressForToday(this.assignedTo);
		}
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

	static copy(todoID, app) {
		/**
		 ** @param {string} todoID - ID of the ToDo that must be copied
		 ** @param {object} app - instance of the ToDoApp 
		 ** @returns {string} copy.id = ID of the newly instantiated copy
		 */

		// return early, if bad input
		if (!todoID) return 1;
		if (!ToDo.exists(todoID)) return 1;

		// extract data from original into a config object
		const original = ToDo.fromStorage(todoID);
		const configStr = JSON.stringify(original);
		const config = JSON.parse(configStr);

		// delete old ID + add COPY suffix to title
		// set createdDate to current date
		delete config.id;
		config.title += ` - ${UI_CONST.COPY[app.lang]}`;
		config.createdDate = Date.now();

		// instantiate copy - return early, if error
		const copy = new ToDo(config);
		if (!ToDo.exists(copy.id)) return 1; 

		return copy.id; // success
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
            this.dueDate = new Date(newDate);
			this.saveToStorage();
            return 0;
        }
	}

	setParent(parent) {
		// enable flexibly passing parent IDs or full object
		const parentID = typeof parent === "object" ? parent.id : parent;
		
		// validate if parentID is a valid todoID from the app
		if (! ToDo.exists(parentID)) {
			console.error(`Could not attachach to parent ToDo. ToDo ID ${parentID} not existing in storage.`);
			return 1;
		}
		
		// check if the todo isn't already assigned to another parent
		if (this.parentID) {
			console.error(`
				Attaching to parent failed. 
				Cannot assign a single ToDo to more than one parent.
				ToDo is already attached to ToDo ID ${this.parentID}`);
			return 1;
		}
			
		// if both OK, set parentID to parentID and return 0 (success)
		this.parentID = parentID;
		this.saveToStorage();

		// add child ID to parent's checklist + save
		const parentTodo = ToDo.fromStorage(parentID);
		if (parentTodo && !parentTodo.checklist.includes(this.id)) {
			parentTodo.checklist.push(this.id);
			parentTodo.saveToStorage();
		}

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
		/**
		 ** @returns {Array} pathArr - array of Project and ToDo instances in hierarchical order 
		 */
		// the method returns an array which is used by the UI_Manager
		// to build a display of the full path of any ToDo with the
		// name of each parent ToDo in the path,
		// while each element in the path except the last should be clickable and 
		// open the respective parent element when clicked.
		//
		// example: "/uncategorized/parent_1/.../parent_n/current_todo"
		
		// =============================================================


		// loop over parents recursively from parent_1 to parent_n,
		// add each parent to the front of the path array
		// in order to replicate the "ancestry" level in the array depth
		const pathArr = [this]; // initialize array with current todo
		let currentParent = this.getParent();

		// use a set to detect circular references
		const visitedIDs = new Set([this.id]);

		while (currentParent && currentParent.id) {

			// make sure the parent is not in the array already to precent circular reference
			if (visitedIDs.has(currentParent.id)) {
				console.error(`Circular reference detected for ToDo ID: ${currentParent.id}`);
				break;
			}
			visitedIDs.add(currentParent.id);
			pathArr.unshift(currentParent);

			// if parentID is null or empty, break loop immediately
			if (! currentParent.parentID) break;

			currentParent = currentParent.getParent();
		}

		// in case the todo belongs to a project, use that as 1st element of the hierarchy
		if (this.project) pathArr.unshift(this.project);
		
		// return the path array
		return pathArr;
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

	addSubTask(subTodoID) {
		if (!subTodoID || subTodoID === this.id) return 1; // forbid circular references 
		if (this.checklist.indexOf(subTodoID) >= 0) return 1 // subtask is already part of this todo's checklist

		// 1. Add ID to the parent's checklist and save
		this.checklist.push(subTodoID);
		this.saveToStorage();

		// 2. Set bidirectional link at child (register parentID)
		const subTodo = ToDo.fromStorage(subTodoID);
		if (subTodo && subTodo.parentID !== this.id) {
			subTodo.parentID = this.id;
			subTodo.saveToStorage();
		}
		return 0; // success
	}

	removeSubTask(subTodoID) {
		if (!subTodoID) return 1;
		const index = this.checklist.indexOf(subTodoID);
        if (index < 0) return 1;

        // 1. Remove ID from parent's checklist and save
        this.checklist.splice(index, 1);
        this.saveToStorage();

        // 2. Remove bidirectional link from child todo (reset parentID to null)
        const subTodo = ToDo.fromStorage(subTodoID);
        if (subTodo && subTodo.parentID === this.id) {
            subTodo.parentID = null;
            subTodo.saveToStorage();
        }
        return 0; // success
	}

	getChecklistProgress() {
        if (!this.checklist || this.checklist.length === 0) return 0;

        // get all child todos from memory/storage
        const childTodos = this.checklist.map(id => ToDo.fromStorage(id)).filter(Boolean);
        
        // count the ones with status DONE
        const doneCount = childTodos.filter(child => child.status === TODO_STATUS.DONE).length;

        // return the rounded percentage
        return Math.round((doneCount / childTodos.length) * 100);
    }

	markAsCompleted() {
		this.status = TODO_STATUS.DONE;
		this.completedDate = Date.now();
		this.saveToStorage();
	}

	// *** methods for redundancy tetection ***

	static calculateStringSimilarity(str1, str2) {
        // filter out every kind of special characters (replace by '')
        const s1 = str1.toLowerCase().replace(/[^a-z0-9\säöüß]/g, '').trim();
        const s2 = str2.toLowerCase().replace(/[^a-z0-9\säöüß]/g, '').trim();

        if (s1 === s2) return 1.0;
        if (s1.length < 2 || s2.length < 2) return 0.0;

        const getBigrams = (str) => {
            const bigrams = new Set();
            for (let i = 0; i < str.length - 1; i++) {
                // i + 2 ist korrekt, da der End-Index bei substring() exklusiv ist
                bigrams.add(str.substring(i, i + 2));
            }
            return bigrams;
        };

        const bigrams1 = getBigrams(s1);
        const bigrams2 = getBigrams(s2);

        let intersection = 0;
        bigrams1.forEach(bigram => {
            if (bigrams2.has(bigram)) intersection++;
        });

        return (2.0 * intersection) / (bigrams1.size + bigrams2.size);
    }

	checkForRedundancy(newSubTaskTitle, similarityThreshold = APP_CONST.DEFAULT_SETTINGS.STD_SIMILARITY_THRESHOLD) {
    
	/*
	** Check for possible redundancy in new subtask titles,
	** based on a similarity threshold
	** @returns {Object|null} - either returns the similar todo or null
	*/
	
		if (!newSubTaskTitle || newSubTaskTitle.trim() === "") return null;

        // get all sibling tasks (which are already in the checklist)
        const existingChildren = this.checklist.map(id => ToDo.fromStorage(id)).filter(Boolean);

        for (const child of existingChildren) {
            const similarity = ToDo.calculateStringSimilarity(child.title, newSubTaskTitle);
            
            // if similarity above threshold (e. g. 60%), return the object in question
            if (similarity >= similarityThreshold) {
                return child; // Gibt die existierende, ähnliche Aufgabe zurück
            }
        }

        return null; // no redundancy detected
    }

	// *** methods for fltering + sorting + display ***

    static getAllActiveToDos() {
		/**
		 ** returns all active todos
		 ** excludes todos with status TRASH_BIN
		 */
        // filter(Boolean) secures against possible RAM zombies
        return Array.from(ToDo.#cache.values())
            .filter(Boolean)
            .filter(todo => todo.status !== TODO_STATUS.TRASH_BIN);
    }

    static filterByProject(projectName) {
		/**
		 ** Filters all active todos by a given project name
		 ** @param {string|null} projectName - Name des Projekts, oder null für "Misc"
		 **/

        const activeToDos = ToDo.getAllActiveToDos();
        
        if (projectName === null || projectName === "Misc") {
            // show all todos which aren't assigned to ANY project
            return activeToDos.filter(todo => !todo.project);
        }
        
        return activeToDos.filter(todo => todo.project === projectName);
    }

    static filterByCategory(categoryNames) {
		/**
		 ** Filtert alle aktiven ToDos nach einer Kategorie.
		 ** @param {string|string[]|null} categoryNames - Name der Kategorie (z.B. "Work" oder "Misc")
		 */
        const activeToDos = ToDo.getAllActiveToDos();
        
        if (!categoryNames || categoryNames === "Misc" || categoryNames === APP_CONST.DEFAULT_SETTINGS.NO_CAT_STD_LABEL) {
            // return all ToDos with empty cat list or "Uncategorized" 
            return activeToDos.filter(todo => !todo.categories || todo.categories.includes(APP_CONST.DEFAULT_SETTINGS.NO_CAT_STD_LABEL) || todo.categories.length === 0);
        }

		// Flexibly handle params - if a single string is passed, wrap it in an array
		const catsToFilter = Array.isArray(categoryNames) ? categoryNames : [categoryNames];

		// if the filter array is empty, return all active todos
		if (catsToFilter.length < 1) return activeToDos;
        
		// return every todo which has at least one of the categoryNames in their list
        return activeToDos.filter(todo => 
			todo.categories && todo.categories.some(cat => catsToFilter.includes(cat)));
    }

    static filterByTeamMember(memberIDs) {
		/**
		 ** Filters all active ToDos by one (or several) team members (via Member-IDs).
		 ** @param {string|string[]|null} memberIDs - one single UUID, an Array of UUIDs, or null/"Misc" for "Unassigned"
		 */
        const activeToDos = ToDo.getAllActiveToDos();
        
        // 1. Catch "Misc" / null Fallback (unassigned todos)
        if (!memberIDs || memberIDs === "Misc" || memberIDs === "Unassigned") {
            return activeToDos.filter(todo => !todo.assignedTo);
        }
        
        // 2. Flexibly handle params: if a single string is passed, put it into an Array
        const idsToFilter = Array.isArray(memberIDs) ? memberIDs : [memberIDs];

        // 3. If array is empty, return all active todos (no filter set)
        if (idsToFilter.length === 0) {
            return activeToDos;
        }

        // 4. return all todos the assignedTo value of which are included in the filter array
        return activeToDos.filter(todo => idsToFilter.includes(todo.assignedTo));
    }                                                                             

    static sortByPriority(todosArray) {
		/**
		* Sorts the passed array by prio (HIGH -> NORMAL -> LOW).
		* uses the constants from const.js (HIGH: 0, NORMAL: 1, LOW: 2).
		*/
        // .slice() copies the array to not change the original
        return todosArray.slice().sort((a, b) => b.prio - a.prio);
    }

    static sortByDeadline(todosArray) {
		/**
		* sorts a passed ToDo-Array by deadline (future first, no deadline last).
		*/
        return todosArray.slice().sort((a, b) => {
            if (!a.dueDate) return 1;  // Keine Deadline nach hinten schieben
            if (!b.dueDate) return -1;
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
    }

}


 