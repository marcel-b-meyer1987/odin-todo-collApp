import { DiaryEntry } from "../../js/DiaryEntry.js";
import { DB_Handler } from "../../js/DB_Handler.js";
import { APP_CONST } from "../../js/const.js";

describe("DiaryEntry class test suite", () => {
    let mockStorage;
    const indexKey = APP_CONST.STORAGE_KEYS.PREFIX +
						APP_CONST.STORAGE_KEYS.USER +
						APP_CONST.STORAGE_KEYS.DIARY;

    beforeEach(() => {
        mockStorage = {};

        spyOn(DB_Handler, 'saveItem').and.callFake((key, value) => {
            mockStorage[key] = String(value);
        });

        spyOn(DB_Handler, 'getItem').and.callFake((key) => {
            return mockStorage[key] || null;
        });

        spyOn(DB_Handler, 'removeItem').and.callFake((key) => {
            delete mockStorage[key];
        });

        DiaryEntry.clearCache();
    });

    it("should correctly format date objects into YYYY-MM-DD", () => {
        const testDate = new Date(2026, 6, 29); // Attention: Month is 0-based (6 = July)
        expect(DiaryEntry.formatDate(testDate)).toBe("2026-07-29");
    });

    it("should automatically save, cache, and index diary entries by date", () => {
        const dateStr = "2026-07-29";
        
        // Act: create diary entry
        const entry = new DiaryEntry({ dateStr: dateStr, content: "Liebes Tagebuch..." });

        // Assert 1: Entry in storage with correct prefix
        expect(mockStorage[`${indexKey}_2026-07-29`]).toBeDefined();

        // Assert 2: The date is registered within the global index
        const index = JSON.parse(mockStorage[indexKey]);
        expect(index).toContain(dateStr);

        // Assert 3: Entry can be read from storage without error
        DiaryEntry.clearCache(); // ensure DB-Read
        const reloaded = DiaryEntry.fromStorage(dateStr);
        expect(reloaded.content).toBe("Liebes Tagebuch...");
    });
});
