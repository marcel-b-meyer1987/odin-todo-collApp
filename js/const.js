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


export const UI_CONST = {
    APP_LOGO: `<span class="app-logo" id="nav-home" style="font-style: italic;">T</span>`,
    SEARCHBAR_PLACEHOLDER: "Search & Filter",
    COPY: {
        en: "Copy",
        de: "Kopie"
    },
    
    MENU_ITEMS: [
        {
            name: "todos",
            disp_name: {
                en: "ToDos",
                de: "ToDos"
            }
        },
        {
            name: "categories",
            disp_name: {
                en: "Categories",
                de: "Kategorien"
            }
        },
        {
            name: "projects",
            disp_name: {
                en: "Projects",
                de: "Projekte"
            }
        },
        {
            name: "team",
            disp_name: {
                en: "Team",
                de: "Team"
            }
        },
        {
            name: "settings",
            disp_name: {
                en: "Settings",
                de: "Einstellungen"
            }
        },
        {
            name: "about",
            disp_name: {
                en: "About",
                de: "About"
            }
        },
        {
            name: "doc",
            disp_name: {
                en: "Documentation",
                de: "Dokumentation"
            }
        },
        {
            name: "darkmode",
            disp_name: {
                0: {
                    en: "Dark Mode",
                    de: "Dark Mode"
                },
                1:  {
                    en: "Light Mode",
                    de: "Light Mode",
                }
            }
        },
        {
            name: "lang",
            disp_name: {
                en: {
                    en: "English",
                    de: "Englisch"
                },
                de:  {
                    en: "German",
                    de: "Deutsch",
                }
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

export const SYMBOLS = {
    COMPLETE: "✅",
    TEMPLATE: "📐",
    CATEGORY: "🗃️",
    DELETE: "🗑️",
    PENDING: "⭕",
    DATE: "📅",
    CREATE: "📝",
    ATTACH: "📎",
    PIN: "📌",
    FOLDER: "📂",
    CHECKLIST: "📋",
    NOTEPAD: "🗒️",
    SUITCASE: "💼",
    WRITE: "✏️",
    BOOK: "📖",
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

}