export class InputValidator {

    isEmpty(input) {
        if (!input || typeof input.value !== "string") return true; 
        return input.value.trim() === "";
    }

    hasMinLength(input, min) {
        if (!input || typeof input.value !== "string") return false;
        return input.value.trim().length >= min;
    }

    exceedsMaxLength(input, max) {
        if (!input || typeof input.value !== "string") return false;
        return input.value.trim().length > max;
    }

    dateIsPast(date) {
        /**
         ** @param {Date} - expects a date as Date instance OR milliseconds (number)
         ** @returns {Boolean} - true if date lies in the past / false if in Future
         */

        if (!date) return false;

        let dateMs;
        if (typeof date === "number") {
            dateMs = date;
        } else if (date instanceof Date && !isNaN(date.getTime())) {
            dateMs = date.getTime();
        } else {
            return false; // invalid date format
        }

        const now = Date.now();
        const buffer = 1000 * 60 * 60; // 1h in ms

        return dateMs < (now - buffer);

    }
}