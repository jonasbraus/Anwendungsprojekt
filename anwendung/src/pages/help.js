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
            <Back onClick={() => router.back()}/>
            <div className={"help-line"}>
                <img src={screen1.src}/>
                <div className={"text-form"}>
                    <h1>Die Monats-Leiste</h1>
                    <p>- Hier siehst du in welchem Monat Sie sich aktuell befinden (blau hinterlegt)</p>
                    <p>- Durch einen Links-Klick auf eine Monatskacheln springst du direkt an den Anfang des jeweiligen Monats</p>
                </div>
            </div>

            <div className={"help-line"}>
                <img src={screen2.src} width={1000}/>
                <div className={"text-form"}>
                    <h1>Die Planungs-Ansicht</h1>
                    <p>- Hier siehst du deine eingetragenen Vorlesungen in diesem Kurs in Grün, deine eigenen Vorlesungen aus anderen Kursen in Blau und die geplanten Vorlesungen anderer Dozenten in Grau</p>
                    <p>- Durch einen Links-Klick kannst du eine neue Vorlesung an einem Tag erstellen</p>
                    <p>- Durch Halten der dunkleren Leisten ist es möglich die Zeiten deiner Termine anzupassen</p>
                    <p>- Durch einen Rechts-Klick können eigene Termine gelöscht werden</p>
                    <p>- Mithilfe der Navigationsleiste ist es möglich die Wochen zur Planung zu wechseln</p>
                    <p>- Ausgegraute Tage liegen entweder nicht im Semester oder sind Feiertage, hier kann nicht geplant werden</p>
                </div>
            </div>

            <div className={"help-line"}>
                <img src={screen3.src}/>
                <div className={"text-form"}>
                    <h1>Die Warnungs-Ansicht</h1>
                    <p>- Sollte ein Termin gelb erscheinen kannst du hier sehen woran das liegt</p>
                    <p>- Warnung sind empfohlene Verbesserungsverschläge, müssen aber nicht zwangshaft beachtet werden</p>
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
                    <h1>Das Dashboard für Admins</h1>
                    <p>- Hier werden alle bestehenden Semester gelistet</p>
                    <p>- Über den "+" Button ist es möglich ein neues Semester zu erstellen</p>
                    <p>- Über das Stift-Symbol kann ein bestehends Semester editiert werden</p>
                    <p>- Über das Mülleimer-Symbol kann ein bestehndes Semester gelöscht werden</p>
                    <p>- Die Fortschrittsanzeige bleibt auf der (1) bis ein Dozent seinen Plan abgegeben hat, sobald das geschieht wechselt sie auf die (2) und wenn alle Dozenten ihre Pläne abgegeben haben, springt die Anzeige auf die (3)</p>
                </div>
            </div>

            <div className={"help-line"}>
                <img src={screen5.src}/>
                <div className={"text-form"}>
                    <h2>Das Dashboard für Dozenten</h2>
                    <p>- Hier werden alle Semester angzeigt in welchem der eingeloggte Dozent Vorlesungen planen soll</p>
                    <p>- Sollte ein Semester ausgegraut sein, wurden Sie für dieses schon gewählt aber noch nicht freigeschalten</p>
                    <p>- Durch einen Links-Klick auf ein weißes Semester kann in die Planungsübersicht gewechselt werden</p>
                    <p>- Die Fortschrittsanzeige bleibt auf der (1) bis eine Vorlesung geplant wird, sobald das geschieht wechselt sie auf die (2) und wenn der Dozent seinen Plan abgibt, springt die Anzeige auf die (3)</p>
                </div>
            </div>

            <div className={"help-line"}>
                <img src={screen7.src}/>
                <div className={"text-form"}>
                    <h1>Semester erstellen / bearbeiten</h1>
                    <p>- Hier müssen die folgenden Daten eingetragen werden: Kursname sowie Start- und Endzeitpunkt einer Vorlesungsphase</p>
                    <p>- Der Start muss vor dem Endzeitpunkt liegen</p>
                    <p>- Einen Dozenten zu wählen bedeutet ihn dem Kurs hinzuzufügen, sollte ihm kein Modul zugewiesen werden, wird er automatisch abgewählt</p>
                    <p>- Ein Dozent muss mindestens ein, kann aber auch mehrere Module zugewiesen bekommen</p>
                    <p>- Um einem Dozenten mehrere Module zuzuweisen, halte die "STRG"-Taste gedrückt während du per Links klick die Module auswählst</p>
                    <p>- Sobald die Schaltfläche "Freischalten" aktiviert wurde, kann der Dozent mit der eigenständigen Planung beginnen</p>
                    <p>- Jeder genannte Schritt, insbesondere der Letzte kann auch nachträglich im Bearbeitungsmodus ausgeführt werden</p>
                </div>
            </div>
        </div>
    )
}