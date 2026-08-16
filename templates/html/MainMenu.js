import { UI_CONST, SYMBOLS } from "../../js/const.js";
import { TeamMember } from "../../js/TeamMember.js";

export class MainMenu {
    /**
     * Creates the DOM element for the hamburger menu overlay
     * @param {string} userLang - the current language of the user (e. g. "de" or "en")
     * @param {Object} callbacks - click actions for the respective menu points
     */
    static create(userLang, callbacks) {
        const overlay = document.createElement("div");
        overlay.className = "main-menu-overlay";

        const menuContent = document.createElement("div");
        menuContent.className = "menu-content-panel";

        // Close button at the top of the menu panel
        const closeBtn = document.createElement("button");
        closeBtn.innerText = "✕";
        closeBtn.className = "menu-close-btn";
        closeBtn.addEventListener("click", () => callbacks.onClose?.());
        menuContent.appendChild(closeBtn);

        // data-driven creation of menu points from const.js
        UI_CONST.MENU_ITEMS.forEach(item => {
            const btn = document.createElement("button");
            
            // multi-lingual display name
            btn.innerText = item.disp_name[userLang] ?? item.disp_name["en"];
            btn.className = `menu-item-btn action-${item.name}`;

            // Event listener passes on the name of the action
            btn.addEventListener("click", () => {
                callbacks.onAction?.(item.name);
            });

            menuContent.appendChild(btn);
        });

        // Add Logout button at the end, as it is not included in UI_CONST
        const logoutBtn = document.createElement("button");
        logoutBtn.innerText = userLang === "de" ? "Abmelden" : "Logout";
        logoutBtn.innerText += ` ${SYMBOLS.LOGOUT}`;
        logoutBtn.className = "logout-btn";
        logoutBtn.addEventListener("click", () => {
            TeamMember.logout();
            callbacks.onLogout?.();
        });
        menuContent.appendChild(logoutBtn);

        overlay.appendChild(menuContent);

        // Click on the darkened background closes the menu, too 
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) callbacks.onClose?.();
        });

        return overlay;
    }
}
