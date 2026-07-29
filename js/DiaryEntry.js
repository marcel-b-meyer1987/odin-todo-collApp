// ROBERT MEYER

import { DB_Handler } from "./DB_Handler.js";
import { APP_CONST } from "./const.js";

export class DiaryEntry {
    
    // In-Memory Cache for diary entries (key = dateStr, e. g. "2026-07-29")
    static #cache = new Map();
    static #indexKey =  APP_CONST.STORAGE_KEYS.PREFIX +
						APP_CONST.STORAGE_KEYS.USER +
						APP_CONST.STORAGE_KEYS.DIARY;

    constructor(entryData) {
        const { dateStr, content, creationTimestamp, mood } = entryData;
        
        // dateStr serves as unique key (Format: YYYY-MM-DD)
        this.dateStr = dateStr || DiaryEntry.formatDate(new Date());
        this.content = content || "";
        this.creationTimestamp = creationTimestamp || Date.now();
        this.mood = mood || undefined; // Optionales Feld für Emojis oder Stimmungs-Scores

        DiaryEntry.#cache.set(this.dateStr, this);
        this.saveToStorage();
    }

    static formatDate(dateObject) {
        // Static helper method: Converts a date object into proper "YYYY-MM-DD"-formatted string
        const d = new Date(dateObject);
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const year = d.getFullYear();
        return `${year}-${month}-${day}`;
    }

    // --- Storage & cache logic (date-based) ---

    // Gets a list of all diary entries (keys / index) from storage
    static getGlobalIndex() {
        const data = DB_Handler.getItem(DiaryEntry.#indexKey);
        return data ? JSON.parse(data) : [];
    }

    static #addToGlobalIndex(dateStr) {
        const index = DiaryEntry.getGlobalIndex();
        if (!index.includes(dateStr)) {
            index.push(dateStr);
            // sort the index chronologically (oldest entries first)
            index.sort();
            DB_Handler.saveItem(DiaryEntry.#indexKey, JSON.stringify(index));
        }
    }

    static #removeFromGlobalIndex(dateStr) {
        let index = DiaryEntry.getGlobalIndex();
        index = index.filter(d => d !== dateStr);
        DB_Handler.saveItem(DiaryEntry.#indexKey, JSON.stringify(index));
    }

    saveToStorage() {
        DB_Handler.saveItem(`${DiaryEntry.#indexKey}_${this.dateStr}`, JSON.stringify(this));
        DiaryEntry.#cache.set(this.dateStr, this);
        DiaryEntry.#addToGlobalIndex(this.dateStr);
    }

    static fromStorage(dateStr) {
        if (!dateStr) return null;
        if (DiaryEntry.#cache.has(dateStr)) return DiaryEntry.#cache.get(dateStr);

        const data = DB_Handler.getItem(`${DiaryEntry.#indexKey}_${dateStr}`);
        if (!data) return null; // no entry for this day

        try {
            const parsed = JSON.parse(data);
            return new DiaryEntry(parsed);
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    static clearCache() {
        DiaryEntry.#cache.clear();
    }

    static delete(dateStr) {
        if (!dateStr) return 1;
        
        DiaryEntry.#removeFromGlobalIndex(dateStr);
        DB_Handler.removeItem(`${DiaryEntry.#indexKey}_${dateStr}`);
        DiaryEntry.#cache.delete(dateStr);
        return 0;
    }
}
