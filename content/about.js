import { SYMBOLS } from "../js/const.js";

export const about = {
    en: {
        symbol: SYMBOLS.SPEAK,
        title: "About",
        body: [
            {
                tagName: "p",
                innerText: `
                  ToDo CollApp is a simple web application to help you keep your tasks organized.<br>
                  At the moment, it is only available for single user mode. In the long run, the goal is that users will be able to connect to their team mates for collaboration without the overhead that comes with other applications.  
                `,
            },
            {
                tagName: "p",
                innerText: `
                  This project was born when I was assigned with a project task in the full stack curriculum of <a href="https://www.theodinproject.com/" target="_blank">The Odin Project (TOP)</a> the objective of which was building a ToDo app.<br>
                  Now, this is not the first time I have made a ToDo app, seeing that this kind of application is a notoriously popular topic for YouTube tutorials, boot camps, Udemy courses and the like. Nothing would have stopped me from taking the easy way and just uploading this old code as solution for the project task.`
            },
            {   
                tagName: "p",
                innerText: `
                  But firstly, the first app of this kind I had made indeed <em>was</em> made following a one hour YouTube tutorial and coding along. I had slightly adjusted the styling, added a few minor transitions and some such - but nothing all too spectacular. A little later, I made a few more humble changes, like replacing a text input field by a textarea for better readability, experimenting a little more with event listeners and DOM manipulation to improve what little UX there was. And while I even used the app at my daily office work and it did its job, its features were very limited. Also, improving on it was tedious: The codebase consisted of one HTML file with all the CSS and JavaScript crammed inside style and script tags inside of it. Nothing modular, let alone object-oriented. This was so clearly a beginner's project that it was obious even to me back then that this would never scale and wasn't designed to scale in the first place: It was a nice looking, but rather primitive beginner's project using only the most basic JavaScript features. It's most sophisticated building block was probably its CSS.
                  This codebase clearly wasn't up to the standard that TOP was asking for in this assignment.`
            },
            {
                tagName: "p",
                innerText: `
                  Secondly, the task I was assigned with at TOP was to design an own app, using all the useful techniques of web development that I had learned over the past few months: Designing first, coding later. Modular design. Separating application logic from the UI layer. Object orientation for cleaner code, (hopefully) allowing better scalability and maintainability.
                  The whole point of the project assignment clearly was to make these things stick through hands-on practice and problem solving exercise (albeit problems that had already been solved by others a thousand times before in one way or the other). The point was not so much hacking the code together - but rather the deep, creative thinking, re-thinking, making mistakes and correcting them over and over - all for one purpose and one purpose only: To practice the things that are needed for developing real production-ready code. So, bypassing all of this would not only have been cheating, but I would also have taken an invaluable opportunity for growth away from myself.`
            },
            {   
                tagName: "p",
                innerText: `
                  Thirdly, and perhaps most importantly: During my office job while using the limited features of "my" old ToDo app, I more than once thought about the features that would be nice to have in order to have something more useful. Something that would not only be my own creative work (not coded along with a tutorial), but would also be so user-friendly and helpful for my daily routines, that I would enjoy using it - not only because it was my own design, but also because it was tailor-made for my needs and actually <em>good</em>. Something that I could even recommend to other people on the job to make their work a little easier, too. And, again, not because it was self-made, but because it would be actually helpful and pleasant to use. A tool that I would recommend to others for the same reason that I recommend every other tool to others which I find to be so useful that I'm happy to share it.
                `,
            }
        ]
    },
    de: {
        symbol: SYMBOLS.SPEAK,
        title: "About",
        body: [
            {
                tagName: "p",
                innerText: `
                  ToDo CollApp ist eine einfache Webanwendung, die dir dabei hilft, deine Aufgaben organisiert zu halten.<br>
                  Im Moment ist sie nur für den Einzelbenutzermodus verfügbar. Langfristig ist es das Ziel, dass sich Benutzer mit ihren Teammitgliedern für eine Zusammenarbeit verbinden können – und das ohne den Mehraufwand, der mit anderen Anwendungen einhergeht.  
                `,
            },
            {
                tagName: "p",
                innerText: `
                  Dieses Projekt entstand, als ich im Rahmen des Full-Stack-Lehrplans von <a href="https://www.theodinproject.com/" target="_blank">The Odin Project (TOP)</a> eine Projektaufgabe zugewiesen bekam, deren Ziel es war, eine ToDo-App zu bauen.`
            },
            {
                tagName: "p",
                innerText: `
                  Nun ist dies nicht das erste Mal, dass ich eine ToDo-App erstellt habe, da diese Art von Anwendung ein bekanntermaßen beliebtes Thema für YouTube-Tutorials, Bootcamps, Udemy-Kurse und Ähnliches ist. Nichts hätte mich davon abgehalten, den einfachen Weg zu gehen und einfach diesen alten Code als Lösung für die Projektaufgabe hochzuladen.`
            },
            {
                tagName: "p",
                innerText: `
                  Aber erstens wurde die erste App dieser Art, die ich je gemacht hatte, tatsächlich nach einem einstündigen YouTube-Tutorial erstellt, das ich einfach nachprogrammiert habe. Ich hatte das Styling leicht angepasst, ein paar kleinere Übergänge und Ähnliches hinzugefügt – aber nichts allzu Spektakuläres. Ein wenig später nahm ich ein paar weitere bescheidene Änderungen vor, wie das Ersetzen eines Texteingabefelds durch eine Textarea für eine bessere Lesbarkeit, und experimentierte etwas mehr mit Event-Listenern und DOM-Manipulation, um die ohnehin geringe UX zu verbessern. Und obwohl ich die App sogar bei meiner täglichen Büroarbeit nutzte und sie ihren Zweck erfüllte, waren ihre Funktionen sehr begrenzt. Auch jegliche Verbesserung daran vorzunehmen war mühsam: Die Codebasis bestand aus einer einzigen HTML-Datei, in der das gesamte CSS und JavaScript in Style- und Script-Tags hineingepfercht war. Nichts Modulares, geschweige denn Objektorientiertes. Dies war so eindeutig ein Anfängerprojekt, dass selbst mir damals klar war, dass es niemals skalierbar war und von vornherein nicht für eine Skalierung ausgelegt war: Es war ein hübsch anzusehendes, aber recht primitives Anfängerprojekt, das nur die grundlegendsten JavaScript-Funktionen nutzte. Sein anspruchsvollster Baustein war wahrscheinlich das CSS.
                  Diese Codebasis entsprach ganz klar nicht dem Standard, den TOP in dieser Aufgabe verlangte.`
            },
            {   
                tagName: "p",
                innerText: `
                  Zweitens bestand die Aufgabe, die mir bei TOP zugewiesen wurde, darin, eine eigene App zu entwerfen und dabei all die nützlichen Techniken der Webentwicklung zu nutzen, die ich in den vergangenen Monaten gelernt hatte: Erst entwerfen, später programmieren. Modulares Design. Trennung der Anwendungslogik von der UI-Ebene. Objektorientierung für saubereren Code, der (hoffentlich) eine bessere Skalierbarkeit und Wartbarkeit ermöglicht.
                  Der eigentliche Sinn der Projektaufgabe bestand eindeutig darin, diese Dinge durch praktische Anwendung und Problemlösungsübungen zu verinnerlichen (wenn auch Probleme, die von anderen schon tausendmal zuvor auf die eine oder andere Weise gelöst worden waren). Es ging nicht so sehr darum, den Code zusammenzuhacken – sondern vielmehr um das tiefe, kreative Nachdenken, nochmal Nachdenken, Fehler machen und diese immer und immer wieder zu korrigieren – alles für einen einzigen Zweck: Die Dinge zu üben, die für die Entwicklung von echtem, produktionsreifem Code erforderlich sind. Dies alles zu umgehen, wäre also nicht nur geschummelt gewesen, sondern ich hätte mir selbst damit auch eine unschätzbare Gelegenheit zur Weiterentwicklung genommen.`
            },
            {
                tagName: "p",
                innerText: `
                  Drittens und vielleicht am wichtigsten: Während meines Bürojobs, bei dem ich die eingeschränkten Funktionen „meiner“ alten ToDo-App nutzte, dachte ich mehr als einmal über Funktionen nach, die ich gerne hätte, um etwas Nützlicheres zu haben. Etwas, das nicht nur meine eigene kreative Arbeit wäre (nicht anhand eines Tutorials nachprogrammiert), sondern das auch so benutzerfreundlich und hilfreich für meine täglichen Aarbeitsabläufe wäre, dass ich es gerne nutzen würde – nicht nur, weil es mein eigenes Design wäre, sondern auch, weil es maßgeschneidert für meine Bedürfnisse wäre und tatsächlich <em>gut</em>. Etwas, das ich sogar anderen Leuten im Job empfehlen könnte, um auch ihnen die Arbeit ein wenig zu erleichtern. Und wiederum nicht, weil es selbstgemacht ist, sondern weil es tatsächlich hilfreich und angenehm zu benutzen ist. Ein Tool, das ich anderen aus demselben Grund empfehlen würde, aus dem ich jedes andere Tool empfehle, das ich so nützlich finde, dass ich es gerne weiterempfehle.
                `,
            }
        ]
    }

}