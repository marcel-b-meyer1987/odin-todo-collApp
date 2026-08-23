export const TODO_STATUS = {
    PENDING: 0,
    DONE: 1,
    TRASH_BIN: 2
}

export const TODO_PRIO = {
    HIGH: 2,
    NORMAL: 1,
    LOW: 0
}

export const APP_CONST = {
    STORAGE_KEYS: {
        PREFIX: "TODO_COLLAPP_", // prefix for all stored strings of the app
        USER: "USER_",
        TODOS: "TODOS",
        CATS: "CATEGORIES", // to retrieve a list of all categories
        PROJECTS: "PROJECTS", // to retrieve a list of all projects
        TEAM: "TEAM", // to retrieve a list of team members
        DIARY: "DIARY", // to retrieve a list of diary entries
        PROGRESS: "PROGRESS", // to retrieve progress entries from storage
        TRASH_BIN: "TRASH_BIN" // to retrieve the list of ids of recycled todos
    },

    DEFAULT_SETTINGS: {
        TRASH_BIN_DEFAULT_PRESERVE_DURATION: 30, // how many days should todos be preserved within trash bin before final deletion
        STD_SIMILARITY_THRESHOLD: 0.6, // standard treshold for title similarity within the same todo "tree", used for redundancy warnings 
        NO_CAT_STD_LABEL: "Uncategorized", // standard placeholder label for uncategorized todos
        LANG: "en", // standard display language for the UI
        MAX_TITLE_LENGTH: 255, // = TINYTEXT SQL data type
        MAX_NOTES_LENGTH: 255, // = TINYTEXT SQL data type
    },

    MOODS: {
        HAPPY: ":smile:",
        NEUTRAL: ":neutral:",
        SAD: ":sad:",
        THINKING: ":thinking:",
        STRONG: ":muscle:",
    }
}

export const SYMBOLS = {
    COMPLETE: "✅",
    TEMPLATE: "📐",
    CATS: "🗃️",
    DELETE: "🗑️",
    PENDING: "⭕",
    DATE: "📅",
    CREATE: "📝",
    ATTACH: "📎",
    PIN: "📌",
    FOLDER: "📂",
    CHECK: "&#9745",
    CHECKLIST: "📋",
    NOTEPAD: "🗒️",
    SUITCASE: "💼",
    WRITE: "✏️",
    BOOK: "📖",
    DOCS: "📚",
    DIARY: "📔",
    CD: "💿",
    FLOPPY: "💾",
    TOOLS: "🛠️",
    WRENCH: "🔧",
    CONFIG: "⚙️",
    LIGHTBULB: "💡",
    SEARCH: "🔍",
    TAG: "🏷️",
    ID: "🪪",
    BELL: "🔔",
    SPEAKER: "📢",
    PERSON: "👤",
    TEAM: "👥",
    SPEAK: "💬",
    STRONG: "💪",
    THUMB: "👍",
    FIRE: "🔥",
    STARS: "✨",
    ROCKET: "🚀",
    COOL: "😎",
    HAPPY: "😊",
    UP: "⬆️",
    LOGOUT: "",

}


export const UI_CONST = {
    APP_LOGO: `<span class="app-logo" id="nav-home" style="font-style: italic;">T</span>`,
    SEARCHBAR_PLACEHOLDER: "Search & Filter",
    PATH_SEPARATOR: " / ",
    
    COPY: {
        en: "Copy",
        de: "Kopie"
    },

    // Localisation for the labels
    LABELS: {
        de: { title: "Aufgabe", notes: "Notizen", editDue : "Fälligkeitsdatum bearbeiten", created : "Erstellt:", due: "Fällig", checklist : "Checkliste bearbeiten", cats : "Kategorie hinzufügen", assign : "Mitarbeiter zuweisen", createTeamMember : "Mitarbeiter erstellen", save : "Speichern", abort : "Abbrechen", add: "Neu", changePrio: "Priorität ändern", open: "Öffnen", markComplete: "Als erledigt markieren", copy: "Kopieren", moveToTrash: "In den Papierkorb", asTemplate: "Als Vorlage speichern" },
        en: { title: "Task", notes: "Notes", editDue : "Edit Due Date", created : "Created on:", due : "Due date:", checklist : "Edit checklist", cats : "Add category", assign : "Assign to Team Member", createTeamMember : "Add New Team Member", save : "Save", abort : "Abort", add: "Add", changePrio: "Change Priority", open: "Open", markComplete: "Mark As Completed", copy: "Copy", moveToTrash: "Move To Trash", asTemplate: "Save As Template" },
    },
    
    MENU_ITEMS: [
        {
            name: "todos",
            disp_name: {
                en: `${SYMBOLS.CHECKLIST} ToDos`,
                de: `${SYMBOLS.CHECKLIST} ToDos`
            }
        },
        {
            name: "categories",
            disp_name: {
                en: `${SYMBOLS.CATS} Categories`,
                de: `${SYMBOLS.CATS} Kategorien`,
            }
        },
        {
            name: "projects",
            disp_name: {
                en: `${SYMBOLS.TOOLS} Projects`,
                de: `${SYMBOLS.TOOLS} Projekte`,
            }
        },
        {
            name: "team",
            disp_name: {
                en: `${SYMBOLS.TEAM} Team`,
                de: `${SYMBOLS.TEAM} Team`,
            }
        },
        {
            name: "settings",
            disp_name: {
                en: `${SYMBOLS.CONFIG} Settings`,
                de: `${SYMBOLS.CONFIG} Einstellungen`,
            }
        },
        {
            name: "about",
            disp_name: {
                en: `${SYMBOLS.SPEAK} About`,
                de: `${SYMBOLS.SPEAK} About`,
            }
        },
        {
            name: "doc",
            disp_name: {
                en: `${SYMBOLS.DOCS} Documentation`,
                de: `${SYMBOLS.DOCS} Dokumentation`,
            }
        },
    ],

    CONTEXT_MENU_ITEMS: [
        {
            name: "open",
            disp_name: {
                en: "Details",
                de: "Details"
            }
        },
        {
            name: "markComplete",
            disp_name: {
                en: "Mark as complete",
                de: "Als erledigt markieren"
            }
        },
        {
            name: "template",
            disp_name: {
                en: "Save As Template",
                de: "Als Vorlage speichern"
            }
        },
        {
            name: "detach",
            disp_name: {
                en: "Detach",
                de: "Herauslösen"
            }
        },
        {
            name: "delete",
            disp_name: {
                en: "Delete (Trash Bin)",
                de: "Löschen (Papierkorb)"
            }
        },
    ],

    ERRORS: {
        EMPTY_TITLE: {
            en: "Title may not be left blank.",
            de: "Bitte geben Sie einen Titel ein."
        },
        LONG_TITLE: {
            en: `Title may not be longer than ${APP_CONST.DEFAULT_SETTINGS.MAX_TITLE_LENGTH} characters.`,
            de: `Der Titel darf nur ${APP_CONST.DEFAULT_SETTINGS.MAX_TITLE_LENGTH} Zeichen lang sein.`
        },
        LONG_NOTES: {
            en: `Notes may not be longer than ${APP_CONST.DEFAULT_SETTINGS.MAX_NOTES_LENGTH} characters.`,
            de: `Die Notizen dürfen maximal ${APP_CONST.DEFAULT_SETTINGS.MAX_NOTES_LENGTH} Zeichen lang sein.`
        },
        PAST_DATE: {
            en: "The due date may not be set to a date in the past.",
            de: "Das Fälligkeitsdatum darf nicht in der Vergangenheit liegen."
        }
    },
}

// DIETER