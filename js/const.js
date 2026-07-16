export const TODO_STATUS = {
    PENDING: 0,
    DONE: 1,
    TRASH_BIN: 2
}

export const TODO_PRIO = {
    HIGH: 0,
    NORMAL: 1,
    LOW: 2
}

export const APP_CONST = {
    STORAGE_KEYS: {
        PREFIX: "TODO_COLLAPP_", // prefix for all stored strings of the app
        USER: "USER_",
        TODOS: "TODOS",
        CATS: "CATEGORIES", // to retrieve a list of all categories
        PROJECTS: "PROJECTS", // to retrieve a list of all projects
        TEAM: "TEAM", // to retrieve a list of 
        TRASH_BIN: "TRASH_BIN" // to retrieve the list of ids of recycled todos
    }
}

export const UI_CONST = {
    MENU_ITEMS: [
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
            name: "About",
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
        
    ],
}