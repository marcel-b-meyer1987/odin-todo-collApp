import { TODO_STATUS, TODO_PRIO } from "./const.js";
import { Project } from "./project.js";

export class ToDo {
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
		trashBinDate
	}) {
		this.id = id || crypto.randomUUID();
		this.title = title || "New ToDo";
		this.notes = notes || "";
		this.createdDate = createdDate || Date.now();
		this.dueDate = dueDate || Date.now();
		this.parent = parentID || undefined;
		this.checklist = checklist || [];
		this.status = status || TODO_STATUS.PENDING;
		this.project = project || null;
		this.categories = categories || [];
		this.assignedTo  = assignedTo || undefined;
		this.prio = prio || TODO_PRIO.NORMAL;
		this.customSortNo = customSortNo || undefined;
		this.trashBinDate = trashBinDate || undefined;
		// needed to calculate the day that the Todo will be deleted from trash for good / default undefined means: not recycled 
	}
	
	saveToStorage() {

		// save to localStorage (later: IndexedDB)
		localStorage.setItem(`${this.id}`, JSON.stringify(this));
	}

	static fromStorage(todoID) {

		const data = localStorage.getItem(todoID);
		console.log("Raw data:", data);
		console.log("Parsed data:", JSON.parse(data));

		try {
			
			// load todo with todoID from localStorage (later: IndexedDB)
			const {	id,
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
				} = JSON.parse(data);

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
			return error;
		}
		
	}

}


