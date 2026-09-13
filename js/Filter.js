export class Filter {

    constructor(app) {
        this.app = app;
        
        this.categories = null;
        this.assignedTo = null;
        this.prios = null;
        this.createdDates = {
            from: 0,
            to: Infinity
        };
        this.dueDates = {
            from: 0,
            to: Infinity
        };
        
        this.functions = [];
    }

    applyFilterFunctions(items) {
        /**
         ** @param {Array} items - an array of items to be filtered
         ** @returns {Array} filtered - the array of filteres items
         */

        // apply all filter functions to the items array, one by one, if any
        // if no active filter functions, just return the same array 1:1

        let filtered = items;

        this.functions?.forEach(func => {
            filtered = filtered.filter(item => func(item));
        });

        return filtered;
    }

    set(configObj) {
        /**
         ** @param {object} configObj - object holding the filter values to be set
         */
        
        this.categories = configObj.categories ?? null;
        this.assignedTo = configObj.assignedTo ?? null;
        this.prios = configObj.prios ?? null;
        this.createdDates.from = configObj.createdDatesFrom ?? 0;
        this.createdDates.to = configObj.createdDatesTo ?? Infinity;
        this.dueDates.from = configObj.dueDatesFrom ?? 0;
        this.dueDates.to = configObj.dueDatesTo ?? Infinity;
        
        // UPDATE THE FILTER FUNCTIONS ACCORDING TO THE VALUES - SEE DEFINITIONS BELOW

        // check categories matching, if any 
        if (this.categories) this.functions.push(this.catsMatch.bind(this));

        // check team member assignations matching, if any
        if (this.assignedTo) this.functions.push(this.assignMatch.bind(this));

        // check prio match, if any
        if (this.prios) this.functions.push(this.prioMatch.bind(this));

        // check if createdDate is in range, if any
        if (this.createdDates.from > 0 || this.createdDates.to < Infinity) {
            this.functions.push(this.createdDateInRange.bind(this));
        }

        // check if dueDate is in range, if any
        if (this.dueDates.from > 0 || this.dueDates.to < Infinity) {
            this.functions.push(this.dueDateInRange.bind(this));
        }
    
    }

    reset() {
        // reset all filter values
        this.categories = null;
        this.assignedTo = null;
        this.prios = null;
        this.createdDates.from = 0;
        this.createdDates.to = Infinity;
        this.dueDates.from = 0;
        this.dueDates.to = Infinity;

        // reset all filter functions
        this.functions = [];

        // apply filter
        // this.apply(); --- this should be called from outside, to pass the needed todos array as an argument
    }


    // #################################
    // ### FILTER FUNCTION DEFINITIONS #
    // #################################
     
    // FUNCTIONS MUST RETURN BOOLEANS TO BE ABLE TO BE PASSED TO ARRAY.FILTER()

    // check categories matching
    catsMatch = (todo) => this.categories.some(cat => todo?.categories?.includes(cat));

    // check team member assignations matching
    assignMatch = (todo) => this.assignedTo.some(member => todo?.assignedTo?.includes(member));

    // check prio match
    prioMatch = (todo) => this.prios.includes(todo?.prio);

    // check if createdDate is in range
    createdDateInRange = (todo) => {
        const inRange = (todo.createdDate >= this.createdDates.from && todo.createdDate <= this.createdDates.to);
        return inRange;
    }

    // check if dueDate is in range
    dueDateInRange = (todo) => {
        const inRange = (todo.dueDate >= this.dueDates.from && todo.dueDate <= this.dueDates.to);
        return inRange;
    }

}