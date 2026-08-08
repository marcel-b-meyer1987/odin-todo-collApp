import { InputValidator } from "../../js/InputValidator.js";

describe('InputValidator', () => {
    let validator;

    beforeEach(() => {
        validator = new InputValidator();
    });

    describe('isEmpty', () => {
        it('sollte false zurückgeben, wenn der Input Text enthält', () => {
            const input = { value: 'Hallo' };
            expect(validator.isEmpty(input)).toBe(false);
        });

        it('sollte true zurückgeben, wenn der Input nur aus Leerzeichen besteht', () => {
            const input = { value: '   ' };
            expect(validator.isEmpty(input)).toBe(true);
        });

        it('sollte true zurückgeben, wenn der Input komplett leer ist', () => {
            const input = { value: '' };
            expect(validator.isEmpty(input)).toBe(true);
        });
    });

    describe('hasMinLength', () => {
        it('sollte true zurückgeben, wenn die Länge genau dem Minimum entspricht', () => {
            const input = { value: 'abc' };
            expect(validator.hasMinLength(input, 3)).toBe(true);
        });

        it('sollte true zurückgeben, wenn die Länge das Minimum überschreitet', () => {
            const input = { value: 'abcdef' };
            expect(validator.hasMinLength(input, 3)).toBe(true);
        });

        it('sollte false zurückgeben, wenn die Länge unter dem Minimum liegt', () => {
            const input = { value: 'ab' };
            expect(validator.hasMinLength(input, 3)).toBe(false);
        });

        it('sollte Leerzeichen am Anfang und Ende ignorieren', () => {
            const input = { value: '  ab  ' };
            expect(validator.hasMinLength(input, 3)).toBe(false);
        });
    });

    describe('exceedsMaxLength', () => {
        it('sollte false zurückgeben, wenn die Länge genau dem Maximum entspricht', () => {
            const input = { value: 'abc' };
            expect(validator.exceedsMaxLength(input, 3)).toBe(false);
        });

        it('sollte false zurückgeben, wenn die Länge unter dem Maximum liegt', () => {
            const input = { value: 'ab' };
            expect(validator.exceedsMaxLength(input, 3)).toBe(false);
        });

        it('sollte true zurückgeben, wenn die Länge das Maximum überschreitet', () => {
            const input = { value: 'abcdef' };
            expect(validator.exceedsMaxLength(input, 3)).toBe(true);
        });

        it('sollte Leerzeichen am Anfang und Ende beim Kürzen ignorieren', () => {
            const input = { value: '  abc  ' };
            expect(validator.exceedsMaxLength(input, 3)).toBe(false);
        });
    });

    describe('dateIsPast', () => {
        const baseTime = new Date('2026-01-01T12:00:00Z'); // Feste Basiszeit für Unit Tests
        const oneHourInMs = 1000 * 60 * 60;

        beforeEach(() => {
            jasmine.clock().install();
            jasmine.clock().mockDate(baseTime); // Friert "Date.now()" ein
        });

        afterEach(() => {
            jasmine.clock().uninstall();
        });

        it('sollte true zurückgeben, wenn das Datum als Date-Instanz mehr als 1 Std. in der Vergangenheit liegt', () => {
            const pastDate = new Date(baseTime.getTime() - (oneHourInMs + 1000));
            expect(validator.dateIsPast(pastDate)).toBe(true);
        });

        it('sollte false zurückgeben, wenn das Datum als Date-Instanz exakt 1 Std. in der Vergangenheit liegt', () => {
            const boundaryDate = new Date(baseTime.getTime() - oneHourInMs);
            expect(validator.dateIsPast(boundaryDate)).toBe(false);
        });

        it('sollte false zurückgeben, wenn das Datum in der Zukunft liegt', () => {
            const futureDate = new Date(baseTime.getTime() + oneHourInMs);
            expect(validator.dateIsPast(futureDate)).toBe(false);
        });

        it('sollte true zurückgeben, wenn der Zeitstempel (Millisekunden) mehr als 1 Std. in der Vergangenheit liegt', () => {
            const pastTimestamp = baseTime.getTime() - (oneHourInMs + 1000);
            expect(validator.dateIsPast(pastTimestamp)).toBe(true);
        });

        it('sollte false zurückgeben, wenn der Zeitstempel (Millisekunden) in der Zukunft liegt', () => {
            const futureTimestamp = baseTime.getTime() + oneHourInMs;
            expect(validator.dateIsPast(futureTimestamp)).toBe(false);
        });
    });
});

describe('InputValidator - Edge Cases und Fehlerbehandlung', () => {
    let validator;

    beforeEach(() => {
        validator = new InputValidator();
    });

    describe('isEmpty (Edge Cases)', () => {
        it('sollte true zurückgeben, wenn input null oder undefined ist', () => {
            expect(validator.isEmpty(null)).toBe(true);
            expect(validator.isEmpty(undefined)).toBe(true);
        });

        it('sollte true zurückgeben, wenn value kein String ist (z.B. Zahl oder Objekt)', () => {
            expect(validator.isEmpty({ value: 123 })).toBe(true);
            expect(validator.isEmpty({ value: null })).toBe(true);
        });
    });

    describe('hasMinLength (Edge Cases)', () => {
        it('sollte false zurückgeben, wenn input ungültig ist', () => {
            expect(validator.hasMinLength(null, 3)).toBe(false);
            expect(validator.hasMinLength({ value: undefined }, 3)).toBe(false);
        });
    });

    describe('exceedsMaxLength (Edge Cases)', () => {
        it('sollte false zurückgeben, wenn input ungültig ist', () => {
            expect(validator.exceedsMaxLength(null, 5)).toBe(false);
            expect(validator.exceedsMaxLength({ value: 42 }, 5)).toBe(false);
        });
    });

    describe('dateIsPast (Edge Cases)', () => {
        beforeEach(() => {
            jasmine.clock().install();
            jasmine.clock().mockDate(new Date('2026-01-01T12:00:00Z'));
        });

        afterEach(() => {
            jasmine.clock().uninstall();
        });

        it('sollte false zurückgeben bei ungültigen Objekten oder leeren Werten', () => {
            expect(validator.dateIsPast(null)).toBe(false);
            expect(validator.dateIsPast("kein-datum")).toBe(false);
        });

        it('sollte false zurückgeben bei einem invaliden Date-Objekt (Invalid Date)', () => {
            const invalidDate = new Date("Objekt das nicht parst");
            expect(validator.dateIsPast(invalidDate)).toBe(false);
        });
    });
});

