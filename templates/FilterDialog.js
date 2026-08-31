export class FilterDialog {


    static create(app) {
        const dialog = document.createElement("div");

        dialog.setAttribute("id", "filter-dialog");
        
        dialog.innerHTML = FilterDialog.template;

        return dialog;
    }

    static template = `
        <div>
            <h2>This is the template for the FilterDialog Element</h2>
            <p>Here, you can filter by:</p>
                <ul>
                    <li>Categories (Dropdown with multi-select)</li>
                    <li>TeamMembers (dto.)</li>
                    <li>Priority (dto.)</li>
                    <li>Creation + Due Date (each):
                        <ul>
                            <li>Exact date</li>
                            <li>Before date</li>
                            <li>After date</li>
                            <li>Between dates</li>
                        </ul>
                    </li>
                </ul>
            <p>
                Once the filters are set, this will set a searchFilters object inside
                the app's UI which will thereafter be used for every invocation of
                renderToDoListView, so whenever and wherever in the path the user
                has the app render a list of ToDo objects, all the selected filters
                will be applied, their values set to whatever the user chose.
            </p>    
        </div>

    `;
}