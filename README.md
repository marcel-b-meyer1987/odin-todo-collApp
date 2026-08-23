# ToDo CollApp #
================

## The Path ##
--------------
The App organizes everything in a structure of directories, sub-directories and files - very much as computers do.
In the folder structure of your computer's file system, the visual description of a file's location is called a path.

In a UNIX system (like MacOS) or a Linux system, the origin point of the file system is called the root directory, because it is literally at the root of all files.

You can imagine the file system structure as a tree with the root being at the bottom of everythig - the origin point which splits up into several sub-directories, which then again split up further into more sub-directories and so on, until you arrive at the inner-most level which has no further sub-directories (unless you create a new one), only files.

You can imagine the path of this app just like that:

* At the root level of the path ("/"), you have an overview of everything, as you are at the root of things.

* The deeper you dive into the nested structure of things, using ToDos and their checklists (s. below), the more specific and the longer your path will be, as it will show you the way to items that are nested deeper and deeper.

This path system is what actually sets this app apart from other ToDo apps: By using the [checklist](#the-checklist) function of the ToDos, you can turn any ToDo into a directory containing further files (ToDos) which in turn can each contain their own checklist and so on.


## ToDos ##
-----------

Naturally, ToDos are the building blocks of the usage of the app. 
Each ToDo has:

* A title
* A priority, indicated by an exclamation mark symbol, colored either green (low), orange (normal) or red (high)
* A description/notes
* A creation date (recorded automatically)
* A due date (defaults to 1 week from creation date, but can be changed to any future date by the user)
* A [checklist](#the-checklist), which is empty by default, but can be filled with any number of additional ToDos as sub-tasks for the current ToDo. The link to open the checklist shows the number of checklist items in round brackets - (0) by default.
* A list of categories, labeled with a hashtag/pound sign (#), defaulting to "uncategorized" - the standard category of any ToDo which has no custom category assigned by the user
* A [team member](#Team-Members) assignment, represented by a dropdown list, allowing the user to document which team member this ToDo was assigned to (if any)


### List View vs. Details View ###

An overview of several ToDos is always displayed in the ToDo List View.
The details of a ToDo can be viewed (and edited) in the ToDo Details View. 


### Opening ToDos ###

To open the details of a todo from the List View, hover over the respective ToDo in the list, until the mouse cursor icon changes to the "Zoom In" icon (usually a magnifying glass with a plus sign inside - however, this can vary, depending on your system settings). Then click on it.
When using a mobile device, hit the title of the ToDo you wish to open in the List View.


### Closing ToDos ###

To return from the ToDo Details View to the List View
* after saving: Hit the "Save" button or press the keyboard shortcut Alt + S.
* without saving: Hit the "Abort" button or press the keyboard shortcut Alt + A.


### Creating ToDos ###

To create a new ToDo, push the "+" button.
This will create a new ToDo and directly open it in the Details View for editing and saving.

! IMPORTANT NOTES !
* If you want to keep your new ToDo (with or without editing it), you need to save and close the Details View.
* If you make up your mind and want to discard the new ToDo, just press the "Abort" button to close without saving.


### Change Priority of a ToDo ###

The priority of a ToDo is being displayed both in the List View, as well as the Details View, by a colored exclamation mark in a likewise-colored circle.
Different colors represent different priorities:

* Green = Low
* Orange = Normal (= default)
* Red = High

To change the priority of any ToDo, you can easily switch between the priorities by hitting the exclamation mark.
(This is possible both in the List View and in the Details View.) The switch in priorities will be reflected immediately by a switch of the color, according to the color coding mentioned above.


### Copy ToDos ###

To copy an existing ToDo, click on the Copy icon on the right side of List View (currently 💿).
This will create an exact copy of the existing ToDo, marking the title as a copy, and open it for editing - just as when you create a new ToDo (see [Creating Todos](#creating-todos)).


### Marking ToDos as Completed ###

To mark a ToDo as completed, hit the "Check" icon on the right side of the List View (✅).
This will set the status of the ToDo to "DONE" and remove it from the List View.


### Deleting ToDos (Move to Trash) ###

To move a ToDo to the trash bin, hit the "Trash Bin" icon on the right side of the List View (🗑️).
This will set the status of the ToDo to "TRASH_BIN" and remove it from the List View.


### Save as Template ###

THIS FEATURE IS NOT IMPLEMENTED YET.
Its purpose will be to save an arbitrary ToDo as template, in order to create similar (or identical) ToDos more easily in the future.


## The Checklist ##

Everybody knows situations where the task at hand is not done quickly. Some things are just too big to fit on a post-it note - and thus too big for a single ToDo.
The checklist is the most important feature to help you organize more complex tasks and thereby managing this kind of situations. It allows you to chain tasks together the way they belong together.

The approach works like this:
You set a goal. This can be a long-term goal or maybe something rather generic, even somewhat vague. For this goal, you create a new ToDo in the app and save it.
Next, you re-open the ToDo, then open its checklist. The checklist is still empty at this point, as nothing has been added to it yet.
Now, you think of things that need to be done in order to get closer to your goal - or even reach it. 
For every single one of these things - these sub-tasks -, you add a new ToDo to the checklist of the final goal (i. e. the original ToDo).
In case some of the sub-tasks, too, turn out to be rather complex, just repeat the process: Every ToDo has a checklist, which means: Every ToDo can have sub-tasks. And since the sub-tasks technically are ToDos themselves, every sub-task can have sub-tasks, too. 

This means you can divide your goals into as many tasks and sub-tasks as you like - and group them logically at the same time.

At the same time, the path display allows you to instantly see where in the chain of your goals, your tasks and sub-tasks you are.
For instance:

"/ Promo Event / Location / Room decoration"

Or:

"/ Promo Event / Event program / Speakers"



## Team Members ##