import Background from "@/components/Background";
import Back from "@/components/Back";
import {useRouter} from "next/router";
import screen1 from "@/images/screen1.png"
import screen2 from "@/images/screen2.png"
import screen3 from "@/images/screen3.png"
import screen4 from "@/images/screen4.png"
import screen5 from "@/images/screen5.png"
import screen6 from "@/images/screen6.png"
import screen7 from "@/images/screen7.png"

export default function Help(p)
{
    const router = useRouter()

    return (
        <div>

            <div className={"help-line"}>
                <img src={screen1.src}/>
                <div className={"text-form"}>
                    <h1>Die Monats-Seiten-Leiste</h1>
                    <p>- Hier kannst du sehen in welchem Monat du dich aktuell befindest (blau hinterlegt).</p>
                    <p>- Durch einen Links-Klick auf eine Monatskacheln kannst du direkt an den Anfang dieses Monats springen</p>
                </div>
            </div>

            <div className={"help-line"}>
                <img src={screen2.src}/>
                <div className={"text-form"}>
                    <h1>Die Planungs-Ansicht</h1>
                    <p>- Hier siehst du alle deine Termine in grün (bzw. gelb bei Warnungen) und von anderen Dozenten in grau</p>
                    <p>- Durch einen Links-Klick kannst du eine neue Vorlesung an einem Tag erstellen</p>
                    <p>- Durch Halten der dunkleren Leisten kannst du die Zeiten des Termins anpassen</p>
                    <p>- Durch Rechts-Klick kannst du eine Vorlesung löschen</p>
                    <p>- Durch Klicken auf die Pfeiltasten oben kannst du die Woche wechseln</p>
                    <p>- Bitte beachte, dass du Vorlesungen nur zwischen den beiden Roten linien erstellen kannst</p>
                    <p>- Ausgegraute Tage liegen nicht im Semester, hier kannst du nicht planen</p>
                </div>
            </div>

            <div className={"help-line"}>
                <img src={screen3.src}/>
                <div className={"text-form"}>
                    <h1>Die Warnungs-Ansicht</h1>
                    <p>- Sollte ein Termin gelb erscheinen kannst du hier sehen woran das liegt</p>
                    <p>- Warnung sind empfohlene Verbesserungsverschläge aber müssen nicht zwangshaft beachtet werden</p>
                    <p>- Sollte hier "Okay" für einen Tag stehen ist alles perfekt</p>
                </div>
            </div>

            <div className={"help-line"}>
                <img src={screen5.src}/>
                <div className={"text-form"}>
                    <h1>Der Login</h1>
                    <p>- Hier kannst du dich mit deiner Email und deinem Passwort einloggen</p>
                </div>
            </div>

            <div className={"help-line"}>
                <img src={screen4.src}/>
                <div className={"text-form"}>
                    <h1>Der Logout</h1>
                    <p>- Über diesen Button kannst du dich ausloggen</p>
                    <p>- Loggst du dich nicht selbst aus, wirst du nach 2 Stunden automatisch ausgeloggt</p>
                </div>
            </div>

            <div className={"help-line"}>
                <img src={screen6.src}/>
                <div className={"text-form"}>
                    <h1>Das Dashboard</h1>
                    <h2>Für Admins:</h2>
                    <p>- Über den "+" Knopf kannst du ein neues Semester erstellen</p>
                    <p>- Über den Stift kannst du ein bestehendes Semester editieren</p>
                    <p>- Über den Mülleimer kannst du ein bestehndes Semester löschen</p>
                    <h2>Für Dozenten (und Admins):</h2>
                    <p>- Hier siehst du deine Semester mit den jeweiligen Modulen</p>
                    <p>- Sollte ein Semester bei dir Ausgegraut sein, wurdest du für dieses schon gewählt aber noch nicht freigeschalten</p>
                    <p>- Duch einen Links-Klick auf ein weises Semester kann in die Planungsübersicht gewechselt werden</p>
                </div>
            </div>

            <div className={"help-line"}>
                <img src={screen7.src}/>
                <div className={"text-form"}>
                    <h1>Semester erstellen / bearbeiten</h1>
                    <p>- Hier kannst du alle daten wie Name, Start- und Endzeitpunkt eines Semesters eintragen</p>
                    <p>- Du kannst einen Dozenten "wählen" d.h. er soll in diesem Semester dozieren</p>
                    <p>- Jedem Dozenten kannst du ein Modul zuordnen, welches er dozieren soll</p>
                    <p>- Sobald du die Schaltfläche "Freischalten" aktiviert hast, kann der Dozent mit der eigenständigen Planung beginnen.</p>
                    <p>- Jeder genannte Schritt, insbesondere der Letzte kann auch nachträglich im Bearbeitungsmodus ausgeführt werden</p>
                </div>
            </div>
        </div>
    )
}