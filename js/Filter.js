export class Filter {

    constructor(app) {
        this.app = app;
        this.functions = [];
        this.creationDates = {
            from: 0,
            to: Infinity
        };
        this.dueDates = {
            from: 0,
            to: Infinity
        };
        this.categories = [];
        this.assignedTo = [];
        this.prios = [];
    }

    apply(items) {
        /**
         ** @param {Array} items - an array of items to be filtered
         ** @returns {Array} filtered - the array of filteres items
         */

        // apply all filter functions to the items array, one by one
        let filtered = items;

        this.functions.forEach(func => {
            filtered = filtered.filter(item => func(item));
        });

        return filtered;
    }

    reset() {
        // reset all filter values

        // reset all filter functions
        this.functions = [];

        // apply filter
        // this.apply(); --- this should be called from outside, to pass an argument
    }
}