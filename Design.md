# ToDo CollApp #
================

## Design-Leitfaden ##
----------------------

### Grunsätzliches ###

* Die App soll eine Single Page Application (SPA) sein, um page loads/reloads zu verhindern, was zu besserer UX führen soll. (Da voraussichtlich keine großen Datenmengen mit AJAX/fetch-API o.ä. geladen werden müssen und die notwendigen Daten überwiegend im Cache gehalten werden, ist nicht mit langen Latenzen für das re-rendering zu rechnen)

* Das Projekt soll reines CSS verwenden (kein Tailwind, Bootstrap o. ä.)

* Es stehen noch verschiedene Farbschemen zur Auswahl

* Es wird aber auf jeden Fall ein Farbschema zum Einsatz kommen, das über CSS custom properties (primary-color, secondary-color, accent-color usw.) umgesetzt wird, um Konsistenz und Wartbarkeit zu gewährleisten

* Es soll auch ein dark mode angeboten werden (standardmäßig angepasst an Userpräferenz im Betriessystem/Browser, aber manuell umschaltbar per Button)

* Zur Gewährleistung der Konsistenz/Wartbarkeit/Erweiterbarkeit soll das UI komponentenbasiert und damit modular sein. Die Komponenten sollen im Unterordner /templates des Projekts als eigenständige *.js-Module/Klassen abgelegt sein. Der UI_Handler kann diese importieren und nach Bedarf Instanzen erzeugen, die Variablen mit Inhalt aus der Datenlogik befüllen und das DOM rendern (z.b. `<button id=${btnID} class=${btnStyles}>${btnCaption}</button>` etc.) sowie ggf. event listener für die Komponenten registrieren. 

* Das Design soll responsiv sein. Deswegen muss der Schwerpunkt bei Größen- und Abstandsangaben auf relativen Maßeinheiten liegen (em anstelle von px usw.) und auch moderne Techniken wie minmax() etc. mit in Betracht ziehen, wo es sinnvoll ist.

* Ich gehe von einer Verwendung hauptsächlich auf Laptop-/Desktop-PCs aus (Büroanwendung), möchte aber mit dem Layout für Mobilgeräte beginnen. 

### Mobile Layout ###

Das mobile layout sollte schmal sein (eine Spalte) und mit wenig angezeigten Elementen auskommen.

* Im (relativ schmalen) Header, der "fixed" sein sollte, sollte sich folgendes finden:
    * Das App-Logo, das evtl. die Funktion einer "notification bell" übernehmen soll (vgl. YouTube, Facebook etc.)
    * Ein Suchfeld mit Filter-Button, der ein overlay öffnet ("Detailsuche" o. ä.), in dem der User Filteroptionen auswählen kann
    * Ein Button zum Öffnen eines [Hamburger Menüs](#Menü)

* In der Main-Section sollten die Suchergebnisse der jeweils aktuell gefilterten ToDos/Kategorien/Projekte (oder der andere jeweilige content gem. Menüauswahl) angezeigt werden, und zwar kurz und bündig mit nur zwei Buttons dabei zum
    1. Als erledigt markieren oder
    2. Löschen (in den Papierkorb verschieben)

* Wenn ein user ein ToDo, ein Projekt oder eine Kategorie aus der Ergebnisliste antippt/anklickt, soll die Detailansicht des Items geöffnet werden. In dieser sollen alle Informationen übersichtlich präsentiert werden (im mobile layout ist es evtl. notwendig, die Informationen im ersten Schritt nur teilweise anzuzeigen und weitere Details erst nach Antippen bestimmter Links, Buttons o. ä. einzublenden). 

* In der Detailansicht soll auch die Position des aktuellen Elements als eine Art Ordnerstruktur angezeigt werden, vergleichbar mit dem, was einem der Befehl `pwd` in einem Unix-Terminal anzeigt (hierzu die Methode buildPathObject in der ToDo-Klasse - der UI_Handler sollte analog hierzu eine renderPath-Methode erhalten, die das pathObject des ToDos als argument erwartet und dann den Pfad inkl. anklickbarer Links als DOM-Element erstellt und rendert, wobei es in der Darstellung einen Unterschied machen sollte, ob ein Pfadelement ein ToDo, eine Kategorie oder ein Projekt ist - wiederum ähnlich wie in Unix das Ergebnis ds Befehls `ls`, wo ausführbare Dateien und Ordner anders dargestellt werden als "gewöhnliche" Dateien). Der Pfad sollte als erstes als Block-Element angezeigt werden (die ganze Zeile für sich brauchen) und "fixed" oder zumindest "sticky" sein, sodass die Navigation auch bei evtl. nach unten gescrolltem Inhalt einfach erreichbar ist. Der Pfad sollte z. B. so aussehen, wobei das erste Element nach "root"(/) das Projekt ist, dem die ToDos zugeordnet sind - merke, dass Kategorien nicht im Pfad angezeigt werden, da ein ToDo theoretisch unendlich vielen Kategorien zugeordnet sein kann und umgekehrt (m:n-Beziehung):
    * >/**TÜV 08/2026**/THW/Auflieger/PS-WS 295

* Im Footer (der aber auch schmal gehalten werden sollte) ist Platz für eingeblendete Achievements oder besonders kritische Warn-/Fehlermeldungen (Hinweise zur Inputvalidierung, Redundanzwarnungen etc.). Es ist denkbar, den Footer im mobile layout standardmäßig auszublenden und nur bei Bedarf vorübergehend mit einer entsprechend ansprechenden transition/Animation von unten herein fahren zu lassen.

### Desktop Layout ###

Das Desktop-Layout hat jede Menge Platz und kann mehr Daten auf einen Blick unterbringen, z. B. 

* Dashboard mit verschiedenen Karten (s. u.),
* komplette Such-/Filter-/Sortierleiste dauerhaft eingeblendet, 
* Fortschrittsanzeige, verschiedene Karten für Todos, Projretc., Team, Kategorien,
* etc. pp.

Trotzdem sollte auch - trotz media query - das Layout für den Desktop immernoch so responsiv sein, dass ein user beispielsweise die App als "Splitscreen" in einem Browserfenster anzeigen kann, das auf die halbe Bildschirmbreite (oder -höhe) reduziert ist, ohne dass die UX darunter leidet (Informationen verdeckt, horizontales scrollen notwendig etc.)




### Menü ### {#Menü}

Das Menü bzw. die Menüpunkte sollen data-driven sein, wie das ganze UI: 

* Es gibt in const.js eine Reihe von Parametern in der const-Variablen UI_CONST, darunter
* MENU_ITEMS, ein Array mit einem Objekt für jeden Menüpunkt, das folgendes beinhaltet:
    * name = der Name der gewünschten Funktion, bzw. des betroffenen Bereichs, den der UI_Handler rendern/updaten muss, wobei sich die Funktionalität je nach Menüpunkt unterscheiden kann, da manche Punkte mehr impact haben - z. B. Dark Mode oder Sprachauswahl)
    * disp_name = der Anzeigename (in mehreren Sprachen, als Unterobjekt organisiert), teilweise (bereits sprachunabhängig) in Unterobjekte organisiert, um eine Toggle-Funktionalität mit dynamischer, statusabhängiger Anzeige zu ermöglichen (s.)wiederum Dark Mode oder Sprachauswahl)