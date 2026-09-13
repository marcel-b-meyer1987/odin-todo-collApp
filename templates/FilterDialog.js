export class FilterDialog {

    constructor(app) {
        this.app = app;

        // Create a form element in the DOM as top level element for the FilterDialog
        // <form class="filter-dialog" id="filter-form" popover>
        this.dialog = document.createElement("form");
        this.dialog.className = "filter-dialog";
        this.dialog.setAttribute("id", "filter-form");
        this.dialog.setAttribute("popover","");
        this.dialog.innerHTML = FilterDialog.template;

        // Get references to the DOM elements
        this.linkDOM();
        
        // Populate dropdowns + hide elements which are disabled by default
        this.init();

        // Add event listeners
        this.setupEventListeners();
    }

    linkDOM() {
        this.catsDropdown = this.dialog.querySelector("#cats-dropdown");
        this.assignDropdown = this.dialog.querySelector("#assign-dropdown");
        this.prioDropwdown = this.dialog.querySelector("#prio-dropdown");
        this.creationDateTypeDropdown = this.dialog.querySelector("#creation-date-type");
        this.dueDateTypeDropdown = this.dialog.querySelector("#due-date-type");
        this.creationDateFromInput = this.dialog.querySelector("#creation-date-from");
        this.creationDateToInput = this.dialog.querySelector("#creation-date-to");
        this.creationDatesDivider = this.dialog.querySelector("#creation-date > span");
        this.dueDateFromInput = this.dialog.querySelector("#due-date-from");
        this.dueDateToInput = this.dialog.querySelector("#due-date-to");
        this.dueDatesDivider = this.dialog.querySelector("#due-date > span");

        this.resetBtn = this.dialog.querySelector("#filter-reset-btn");

        // Group together the DOM elements that can be switched on and off,
        // per individual date type, as well as combined
        this.createdSwitchables = [this.creationDatesDivider, this.creationDateToInput];
        this.dueSwitchables = [this.dueDatesDivider, this.dueDateToInput];
        this.allSwitchables = [...this.createdSwitchables, ...this.dueSwitchables];
    }

    init() {

        // Populate the FilterDialog dropdown elements with options
        // 1. 

        // Hide elements which are deactivated by default
        this.allSwitchables.forEach((e) => {
            e.classList.add("hidden");
            e.setAttribute("inert","");
        });
    }

    setupEventListeners() {

        // Setting Filters on input changes


        // Toggling date ranges on and off


        // Reset Button
        this.resetBtn.addEventListener("click", (e) => {
            e.preventDefault();
            app.UI_Manager.Filter.reset();
        });
    }

    reset() {
        // Reset the values in the UI Form

    }

    static template = `
        <button class="filter-close-btn" popovertarget="filter-form" popovertargetaction="hide">x</button>
        <h2>Filter</h2>
        <div class="dropdown-filters">
            <div class="dropdown-container">
                <label for="cats-dropdown">
                    Categories:
                </label>
                    <select name="cats-dropdown" id="cats-dropdown" multiple size="1">
                        <option value="Instandhaltung">Instandhaltung</option>
                        <option value="Rückladungen">Rückladungen</option>
                        <option value="Terminavisierung">Terminavisierung</option>
                    </select>
            </div>
            <div class="dropdown-container">
                <label for="assign-dropdown">
                    Assigned To:
                </label>
                    <select class="custom-select" name="assign-dropdown" id="assign-dropdown" multiple size="1">
                        <option value="Jürgen Agne">Jürgen Agne</option>
                        <option value="Eric Weißgerber">Eric Weißgerber</option>
                        <option value="Carina Brödel">Carina Brödel</option>
                    </select>
            </div>
            <div class="dropdown-container">
                <label for="prio-dropdown">
                    Priority:
                </label>
                    <select class="custom-select" name="prio-dropdown" id="prio-dropdown" multiple size="1">
                        <option value="Low">Low</option>
                        <option value="Normal">Normal</option>
                        <option value="High">High</option>
                    </select>
            </div>
        </div>

        <div class="date-filters">
            <div class="date">
                <div class="date-top-row">
                    <label for="creation-date-from">Creation Date:</label>
                    <select name="creation-date-type" id="creation-date-type">
                        <option value="before">Before</option>
                        <option value="after">After</option>
                        <option value="between">Between</option>
                    </select>
                </div>
                
                <div class="date-container" id="creation-date">
                    <input type="date" name="creation-date-from" id="creation-date-from">
                    <span>-</span>
                    <input type="date" name="creation-date-to" id="creation-date-to">
                </div>
            </div>
            
            <div class="date">
                <div class="date-top-row">
                    <label for="due-date-from">Due Date:</label>
                    <select name="due-date-type" id="due-date-type">
                        <option value="before">Before</option>
                        <option value="after">After</option>
                        <option value="between">Between</option>
                    </select>
                </div>
                
                <div class="date-container" id="due-date">
                    <input type="date" name="due-date-from" id="due-date-from">
                    <span>-</span>
                    <input type="date" name="due-date-to" id="due-date-to">
                </div>
            </div>
        </div>

        <div class="filter-dialog-bottom-row">
            <button id="filter-reset-btn" onClick="resetFilters()">Reset</button>
        </div>
    
    `;
}