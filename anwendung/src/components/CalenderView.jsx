import {useEffect, useRef, useState} from "react";
import Button from "@/components/Button";
import {list} from "postcss";
import Background from "@/components/Background";
import WeekSelector from "@/components/WeekSelector";
import {baseURL} from "@/components/Constants";
import {ErrorType} from "@/components/ErrorType";
import BasicDateCalendar from "@/components/CalendarSideBar";
import feiertagejs from "feiertagejs";
import PopUp from "@/components/PopUp";
import {useRouter} from "next/router";
import {info} from "autoprefixer";

//Dieses Script ist für die Funktionalität der haupt-kalenderansicht

//definiert die höhe einer Zeile
let cellHeight = 20;

let colors = ["#f80000", "#414141"]
//start und ende des semesters (tag)
let semesterStart;
let semesterEnd;
//akuteller tag im jar, mit dem die woche startet
let currentWeekStartDay;
//aktuelles jahr
let currentYear;
//start und end jahr des semesters
let semesterStartYear;
let semesterEndYear;
//akutell ausgewählter Termin (Element)
let selectedElement;
let lastEndTimeDrag;
let lastStartTimeDrag;
let grabbedDown;

//Wochenweiße Variablen:
//Speichert, ob in einem Tag ein Fehler augetreten ist
let isDayOkay = [true, true, true, true, true, true]

//Speichert für jeden Wochentag den Fehlerstatus ab
let errorState = [ErrorType.Okay, ErrorType.Okay, ErrorType.Okay, ErrorType.Okay, ErrorType.Okay, ErrorType.Okay]
//gibt an, ob ein Wochentag ausgegraut ist (z.b. feiertag)
let grayedOut = [false, false, false, false, false, false]

//speichert die "verplante" zeit ab. wichtig für abgeben funktion etc.
let timePlanned = 0

export default function CalenderView(p) {

    //array, welches wochenweiße alle termine beinhaltet
    const [entries, setEntries] = useState([[], [], [], [], [], []])
    //update funktion
    const [update, setUpdate] = useState(false)
    //referenz auf die scroll bar der ansichz
    const scrollRef = useRef(null);

    //variablen für die kalender seitenansicht
    const [startDayCalenderSideBar, setStartDayCalenderSideBar] = useState(0)
    const [startYearCalenderSideBar, setStartYearCalenderSideBar] = useState(2000)
    const [endDayCalenderSideBar, setEndDayCalenderSideBar] = useState(0)
    const [endYearCalenderSideBar, setEndYearCalenderSideBar] = useState(2000)
    const [highlightMonth, setHighlightMonth] = useState(0)
    const [highlightYear, setHighlightYear] = useState(2000)

    //speichert, ob das abgeben popup anzeigt werden soll
    const [popUpToggleAbgeben, setPopUpToggleAbgeben] = useState(false)

    const router = useRouter();


    //funktion, die alle Einträge vom backend liest
    function readEntries() {
        //url für alle tage für die woche
        let url = baseURL + "/entries?semesterid=" + localStorage.getItem("currentsid") +
            "&daynumber=" + currentWeekStartDay + "&yearnumber=" + currentYear + "&sessionid=" + localStorage.getItem("sessionid");
        //hole die id des aktuellen semester
        let currentsid = localStorage.getItem("currentsid")
        //hole die id des aktuellen nutzers
        let userid = localStorage.getItem("userid")

        try {
            //frage die daten am backend über die url an
            fetch(url).then(r => r.json()).then(en => {


                //iterieren über alle 6 wochentage
                for (let i = 0; i < en.length; i++) {
                    //erst einmal ist jeder tag fehlerfrei
                    isDayOkay[i] = true
                    let maxLunchBreak = 0

                    //summe um zu überprüfen, ob 8 stunden am tag schon verplant wurden
                    let daySum = 0
                    //iterieren über jeden termin innerhalb eines tages
                    for (let j = 0; j < en[i].length; j++) {
                        //überpüfen, ob der termin wirklich im aktuellen planungssemester liegt
                        if (en[i][j] != null && currentsid == (en[i][j]).semesterid) {
                            let elem = en[i][j]

                            //hier werden fehler abgefragt, je weiter oben der fehler liegt, um so wichtiger ist er
                            //bedienung falls der termin zu früh liegt
                            if ((elem.timestart - 1) / 4 < 8) {
                                errorState[i] = ErrorType.TooEarly
                                isDayOkay[i] = false
                                break
                                //bedinung, falls der termin zu spät liegt
                            } else if ((elem.timeend - 1) / 4 > 17) {
                                errorState[i] = ErrorType.TooLate
                                isDayOkay[i] = false
                                break
                                //bedinung, falls der termin an einem samstag liegt
                            } else if (new Date(currentYear, 0, elem.daynumber).getUTCDay() === 5) {
                                errorState[i] = ErrorType.Saturday
                                isDayOkay[i] = false
                            } else {
                                //bedinung falls die mittagspause nicht eingehalten wurde
                                //1. ein einziger termin überdeckt die ganze mittagszeit
                                if ((elem.timestart - 1) / 4 <= 11 && (elem.timeend - 1) / 4 >= 14) {
                                    errorState[i] = ErrorType.NotEnoughLunchTime
                                    isDayOkay[i] = false
                                    break
                                    //2. abfragen, ob mehrere termine in kombination die mittagspause überdecken
                                } else if ((elem.timeend - 1) / 4 >= 11 && (elem.timeend - 1) / 4 <= 14) {
                                    let min = 24 * 3

                                    for (let j2 = 0; j2 < en[i].length; j2++) {
                                        if (en[i][j2] != null && (en[i][j2].timestart - 1) / 4 >= 11 && (en[i][j2].timestart - 1) / 4 <= 14 && currentsid == (en[i][j2]).semesterid) {
                                            if (en[i][j2].timestart < min && en[i][j2].timestart >= elem.timeend) {
                                                min = en[i][j2].timestart
                                            }
                                        }
                                    }

                                    if (min - elem.timeend < 3) {
                                        errorState[i] = ErrorType.NotEnoughLunchTime
                                        isDayOkay[i] = false
                                        break
                                    }
                                }

                                //sollte kein fehler gefunden worden sein ist der tag okay.
                                errorState[i] = ErrorType.Okay
                            }

                            //rechne für jeden termin die "delta zeit" (länge des termins) auf die gesamt zeit
                            daySum += elem.timeend - elem.timestart
                        }
                    }

                    //sollte die gesamt zeit über 8 sein, sind zu viele vorlesungen bzw. zu lang an diesem tag verplant
                    if (daySum / 4 > 8) {
                        errorState[i] = ErrorType.TooLong
                        isDayOkay[i] = false
                    }
                }

                //hier ist eine logik für blaue termine, die sich mit grauen überscheiden (von der planung her kein problem)
                //da blau in der aktuellen planung nicht berücksichtig wird, trotzdem sollte dieser fall aus visuellen gründen abgedeckt sein
                for (let i = 0; i < 6; i++) {
                    for (let k = 0; k < 20; k++) {
                        if (en[i][k] != null) {


                            //hier für einen blauen termin wird ein grauer gesucht, der diesen schneidet
                            //in diesem wird der blaue termin verkürzt dargestellt
                            if (en[i][k].semesterid != currentsid) {
                                for (let l = 0; l < 20; l++) {
                                    if (en[i][l] != null && en[i][l].usercreatedbyid != userid) {
                                        if (en[i][l].timestart <= en[i][k].timestart && en[i][l].timeend >= en[i][k].timeend) {
                                            en[i][k] = null;
                                            break
                                        }
                                        if (en[i][k].timestart <= en[i][l].timeend && en[i][k].timestart >= en[i][l].timestart) {
                                            en[i][k].timestart = en[i][l].timeend
                                        }
                                        if (en[i][k].timeend >= en[i][l].timestart && en[i][k].timeend <= en[i][l].timeend) {
                                            en[i][k].timeend = en[i][l].timestart
                                        }
                                    }
                                }
                            }
                            //hier für einen grauen termin der von einem blauen geschnitten wird
                            //hier wird der graue termin verkürzt dargestellt
                            if (en[i][k] != null && en[i][k].usercreatedbyid != userid) {
                                for (let l = 0; l < 20; l++) {
                                    if (en[i][l] != null && en[i][l].semesterid != currentsid) {
                                        if (en[i][l].timestart <= en[i][k].timestart && en[i][l].timeend >= en[i][k].timeend) {
                                            en[i][k] = null;
                                            break
                                        }
                                    }
                                }
                            }
                        }
                    }

                }

                //hier wird überprüft, ob sich ein tag innerhalb der semestergrenzen befindet
                //wenn nicht, muss er ausgegraut werden, damit dort nichts geplant werden kann.
                let j = 0;
                for (let i = Math.round(((new Date(currentYear, 0, currentWeekStartDay) - new Date(currentYear, 0, 0)) / (1000 * 60 * 60 * 24))); i <= Math.round(((new Date(currentYear, 0, currentWeekStartDay + 5) - new Date(currentYear, 0, 0)) / (1000 * 60 * 60 * 24))); i++) {
                    grayedOut[j] = i % Math.round(((new Date(currentYear, 11, 31) - new Date(currentYear, 0, 0)) / (1000 * 60 * 60 * 24))) < semesterStart && semesterEnd && new Date(currentYear, 0, currentWeekStartDay + j).getFullYear() == semesterStartYear || i % Math.round(((new Date(currentYear, 11, 31) - new Date(currentYear, 0, 0)) / (1000 * 60 * 60 * 24))) > semesterEnd && new Date(currentYear, 0, currentWeekStartDay + j).getFullYear() == semesterEndYear
                    if(new Date(currentYear, 0, currentWeekStartDay + j).getFullYear() < semesterStartYear || new Date(currentYear, 0, currentWeekStartDay + j).getFullYear() > semesterEndYear)
                    {
                        grayedOut[j] = true
                    }
                    j++
                }
                //hier wird die ausgrauung für feiertage überprüft
                for (let i = 0; i < 6; i++) {
                    let date = new Date(currentYear, 0, currentWeekStartDay + i)
                    grayedOut[i] = holiday(currentYear, date.getMonth(), date.getDate()) ? holiday(currentYear, date.getMonth(), date.getDate()) : grayedOut[i]
                }

                //die termine können nun angezeigt werden. (der state wird geändert)
                setEntries(en)

                //sollte ein dozent die planugsansicht verwende, muss seine gesamt verplante zeit in der aktuellen vorlesung berechnet werden.
                if(localStorage.getItem("admin") == 0)
                {
                    //es werden alle relevanten termine vom backend angefordert

                    let entriesURL = baseURL + "/entries/all/module?sessionid=" + localStorage.getItem("sessionid") + "&moduleid=" + localStorage.getItem("moduleid")
                    fetch(entriesURL).then(r => r.json()).then(allEn => {
                        let moduleid = localStorage.getItem("moduleid")
                        let sum = 0

                        //die zeitsplannen aller termine werden aufsummiert
                        let checkTime = 0
                        for (let j = 0; j < allEn.length; j++) {
                            if (allEn[j] != null && allEn[j].moduleid == moduleid) {
                                sum += allEn[j].timeend - allEn[j].timestart
                            }
                        }

                        //um auf einen stundensatz von 45 min pro stunde zu kommen muss die resultierende zeit (in 15 min takten) durch 3 geteilt werden.
                        sum /= 3
                        timePlanned = sum
                    })
                }
            }).catch(() => {})
        } catch (e) {

        }
    }

    //hierbei wird ein neu angelegter termin (immer 45 minuten zu beginn) and das backend gesendet
    function pushEntry(currentColumnID, row) {
        let url = baseURL + "/entries" + "?sessionid=" + localStorage.getItem("sessionid")
        //json objekt, das alle relavanten informationen über den termin enthält, resultiert aus der datenbank.
        let json = {
            "id": 0,
            "daynumber": currentWeekStartDay + currentColumnID,
            "yearnumber": currentYear,
            "semesterid": localStorage.getItem("currentsid"),
            "usercreatedbyid": localStorage.getItem("userid"),
            "timestart": row,
            "timeend": row + 3,
            "info": localStorage.getItem("currentmodulename"),
            "moduleid": localStorage.getItem("moduleid")
        }
        fetch(url, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(json)
        }).then(r => {
            //einträge werden nach dem hochladen neu synchronisiert und damit auch validiert
            readEntries()
        })
    }

    //schickt eine delete anfrage für einen termin an das backend
    function deleteEntry(id) {
        let url = baseURL + "/entries?id=" + id + "&sessionid=" + localStorage.getItem("sessionid");
        fetch(url, {
            method: "DELETE"
        }).then(r => readEntries())
    }

    //gibt für ein datum zurück, ob es sich um einen feiertag handelt. Wichtig für die ausgrau funktion.
    //verwendung von feiertagejs (keine garantie auf korrektheit, externe library)
    function holiday(year, month, day) {
        var feiertagejs = require('feiertagejs');
        let today = new Date(year, month, day)
        return feiertagejs.isHoliday(today, 'BW')
    }

    //funktion, welche überprüft, ob an einem tag (column) zu einer gewissen zeit (row) ein termin bereits vorhanden ist
    function checkForElementAtRow(row, column) {
        let currentList = entries[column];
        for (let i = 0; i < currentList.length; i++) {
            if (currentList[i] != null) {
                if (row >= currentList[i].timestart && row <= currentList[i].timeend) {


                    return true;

                }
            }
        }

        return false;
    }

    //kann ein element an einem tag anhand seiner id zurückgeben. Wichtig wenn das gleiche Termin objekt verwendet werden muss.
    function getElementInColumn(id, column) {
        let currentList = entries[column];
        for (let i = 0; i < currentList.length; i++) {
            if (currentList[i] != null) {
                if (currentList[i].id === id) {
                    return currentList[i];
                }
            }
        }

        return null;
    }

    //hier werden termin operationen wie vergrößern oder verkleiner final validiert etc.
    function onMouseUp(e) {
        //überprüft, ob ein element gewählt ist (maus hält einen termin fest)
        if (selectedElement != null) {
            let id = selectedElement.id;

            //überprüft, ob der termin sich über oder unter den erlaubten grenzen von 7 uhr morgens oder 18 uhr abends befindet.
            if ((selectedElement.timestart - 1) / 4 >= 7 && (selectedElement.timeend - 1) / 4 <= 18) {

                //rechnet bei einem überschreiten der gesamtzeit die überschrittene zeit aus, und lässt den termin zurück auf die letze
                //valide länge springen
                let finalTimeEnd = selectedElement.timeend
                let deltaTimeEnd = (selectedElement.timeend - lastEndTimeDrag) / 3
                if (timePlanned + deltaTimeEnd > 20) {
                    finalTimeEnd -= ((timePlanned + deltaTimeEnd) - 20) * 3
                }
                let finalTimeStart = selectedElement.timestart
                let deltaTimeStart = (lastStartTimeDrag - selectedElement.timestart) / 3
                if (deltaTimeStart + timePlanned > 20) {
                    finalTimeStart += (timePlanned + deltaTimeStart - 20) * 3
                }

                //hier wird ein termin (vergrößert oder verkleinert) hinsichtlich seiner zeit am backend geupdated.
                let url = baseURL + "/entries?sessionid=" + localStorage.getItem("sessionid");
                let json = {
                    "id": id,
                    "daynumber": 0,
                    "yearnumber": 0,
                    "semesterid": 0,
                    "usercreatedbyid": 0,
                    "timestart": finalTimeStart,
                    "timeend": finalTimeEnd,
                    "info": "",
                    "moduleid": localStorage.getItem("moduleid")
                }
                fetch(url, {
                    method: "PUT",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(json)
                }).then(r => {
                    //elemente werden nach einem update neu synchronisiert und damit auch validiert
                    readEntries()
                })
            }

            //es gibt kein aktuelle mit der maus "gehaltenes" element mehr.
            selectedElement = null;
        }
    }

    function onMouseMove(e) {
        //überprüft, ob ein element gewählt ist (maus hält einen termin fest)
        if (selectedElement != null) {
            //berechne die zeile (zeit) über welcher sich die maus befindet = die zeile in der planungsansicht in welcher sich die maus befindet
            let y_window = e.clientY;
            let y_target_offset = e.currentTarget.getBoundingClientRect().top;
            let row = Math.floor((y_window - y_target_offset) / cellHeight) + 1;

            //bekomme die nummber des aktuellen tages. 0 = montag, 1 = dienstag usw.
            let currentColumnID = parseInt(e.currentTarget.id)

            //logik sollte ein termin an der unteren kante gezogen werden.
            if (grabbedDown) {
                if (row - 1 > selectedElement.timestart) {

                    //überprüft ob an der gezogenen position keine termine bereits sind.
                    let free = true;
                    for (let i = 0; i < entries[currentColumnID].length; i++) {
                        if (entries[currentColumnID][i] != null && selectedElement !== entries[currentColumnID][i]) {
                            if (row <= entries[currentColumnID][i].timeend &&
                                row >= entries[currentColumnID][i].timestart ||
                                row > entries[currentColumnID][i].timeend &&
                                selectedElement.timestart < entries[currentColumnID][i].timestart) {
                                free = false;
                                break;
                            }
                        }
                    }

                    //sollte keine termine vorhanden sein, kann der termin verlängert bzw. verkürzt werden.
                    if (free) {
                        selectedElement.timeend = row + 1;
                    }
                }
                //logik sollte ein termin an der oberen kante gezogen werden.
            } else if (row + 2 < selectedElement.timeend) {
                //logik wie bei unterer kante
                let free = true;
                for (let i = 0; i < entries[currentColumnID].length; i++) {
                    if (entries[currentColumnID][i] != null && selectedElement !== entries[currentColumnID][i]) {
                        if (row < entries[currentColumnID][i].timeend &&
                            row >= entries[currentColumnID][i].timestart ||
                            row < entries[currentColumnID][i].timestart &&
                            selectedElement.timeend > entries[currentColumnID][i].timestart) {
                            free = false;
                            break;
                        }
                    }
                }

                if (free) {
                    selectedElement.timestart = row;
                }
            }
            setUpdate(!update);
        }
    }

    function onMouseDown(e) {
        //berechnet alle wichtigen informationen, wie die nummer des geklickten tages in der woche und die angeklickte zeit.
        let y_window = e.clientY;
        let y_target_offset = e.currentTarget.getBoundingClientRect().top;
        let row = Math.floor((y_window - y_target_offset) / cellHeight) + 1;
        let currentColumnID = parseInt(e.currentTarget.id)
        let currentId = e.target.id;
        let currentUserID = localStorage.getItem("userid");
        let currentsid = localStorage.getItem("currentsid")

        //sollte ein Links-klick ausgeführt worden sein:
        if (e.button === 0) {
            //überprüfen ob auf einen freien platz gedrückt wurde (e in der id steht für entry)
            if (!currentId.includes("e")) {

                //schauen, ob auf keine resize bar gedrückt wurde
                if (!currentId.includes("grab")) {
                    //sollte im geklickten bereich genug zeit frei sein 3 * 15 min dann lege einen neuen termin an
                    if (!checkForElementAtRow(row + 2, currentColumnID) && !checkForElementAtRow(row + 1, currentColumnID)) {
                        if ((row - 1) / 4 >= 7 && (row + 2) / 4 <= 18) {
                            if (!grayedOut[currentColumnID] && timePlanned + 0.8 < 20) {
                                pushEntry(currentColumnID, row)
                            }
                        }
                    }
                    //wurde auf eine resize leiste gedrückt (nach oben oder unten):
                } else {
                    //hole die id des termins (hierbei darf das entry e nicht mitgenommen werden)
                    let parentID = parseInt(e.target.parentElement.id.replace("e", ""));
                    //überpüfen, ob der termin tatsächlich dem aktuellem dozenten gehört.
                    if (currentUserID == getElementInColumn(parentID, currentColumnID).usercreatedbyid && getElementInColumn(parentID, currentColumnID).moduleid == localStorage.getItem("moduleid")) {
                        //anhand der id herausfinden ob nach oben oder unten gezogen werden sollte
                        //speichere aktuelle daten des termins ab
                        grabbedDown = currentId.includes("down")
                        selectedElement = getElementInColumn(parentID, currentColumnID);
                        lastEndTimeDrag = selectedElement.timeend
                        lastStartTimeDrag = selectedElement.timestart
                    }
                }
            }
            //sollte ein Rechts-klick ausgeführt worden sein:
        } else if (e.button === 2) {
            //id holen
            let parentID = parseInt(e.target.id.replace("e", ""));
            //überpüfen, ob der termin tatsächlich dem aktuellen dozenten gehört
            if (currentUserID == getElementInColumn(parentID, currentColumnID).usercreatedbyid && currentId.includes("e") && getElementInColumn(parentID, currentColumnID).moduleid == localStorage.getItem("moduleid")) {
                //aktuellen termin löschen
                let id = parseInt(currentId.replace("e", ""))
                errorState[currentColumnID] = ErrorType.Okay
                deleteEntry(id)
            }
        }
    }

    //wenn die woche nach links gewechselt wurden, müssen tages und wochendaten angepasst werden.
    function onWeekLeft() {
        currentWeekStartDay -= 7;
        let date = new Date(currentYear, 0, currentWeekStartDay + 5)
        setHighlightMonth(date.getMonth())
        setHighlightYear(date.getFullYear())

        for (let i = 0; i < errorState.length; i++) {
            errorState[i] = ErrorType.Okay
        }

        //einträge müssen für die neue woche neu geholt werden.
        readEntries()
    }

    //inverse logik zu nach links
    function onWeekRight() {
        currentWeekStartDay += 7;
        let date = new Date(currentYear, 0, currentWeekStartDay + 5)
        setHighlightMonth(date.getMonth())
        setHighlightYear(date.getFullYear())

        for (let i = 0; i < errorState.length; i++) {
            errorState[i] = ErrorType.Okay
        }

        readEntries()
    }

    //gibt die farbe eines termins anhand der gegebenen parameter zurück
    function getEntryColor(userCreatedByID, columnID, semesterid, moduleid) {
        let id = localStorage.getItem("userid");
        let currentsid = localStorage.getItem("currentsid")
        if(localStorage.getItem("admin") == 0)
        {
            //ist der termin vom nutzer selbst:
            if (id == userCreatedByID) {
                if (isDayOkay[columnID] && moduleid == localStorage.getItem("moduleid")) {
                    return "#77932b";
                    //ist der termin vom nutzer selbst aber liegt in einem anderen fach / modul, dann wird er blau
                } else if (moduleid != localStorage.getItem("moduleid")) {
                    return "#346991";
                    //gibt es ein problem mit einem einem termin der wohl im aktuellen fach liegt, wird er gelb
                } else {
                    return "#e5a10e";
                }

                //von anderen nutzern...
            } else {
                return "#a2a2a2";
            }
        }
        //oder für die ansicht von admins immer grau
        else
        {
            return "#a2a2a2";
        }
    }

    //gleiche logik wie für die termine, nur mit etwas dunkleren farbwerten
    function getResizeBarColor(userCreatedByID, columnID, semesterid, moduleid) {
        let id = localStorage.getItem("userid");
        let currentsid = localStorage.getItem("currentsid")
        if(localStorage.getItem("admin") == 0)
        {
            if (id == userCreatedByID) {
                if (isDayOkay[columnID] && moduleid == localStorage.getItem("moduleid")) {
                    return "#5a6c20";
                } else if (moduleid != localStorage.getItem("moduleid")) {
                    return "#346991"
                } else {
                    return "#c08809";
                }
            } else {
                return "#a2a2a2";
            }
        }
        else
        {
            return "#a2a2a2";
        }
    }

    //beim neu laden der seite:
    useEffect(() => {
        //kleines delay zum start, um ladefehler zu vermeiden.
        setTimeout(() => {
            //setze allde daten zum beginn auf ihre default werte.
            semesterStart = 0;
            semesterEnd = 0;
            semesterStartYear = 0;
            semesterEndYear = 0;
            currentWeekStartDay = 0;
            currentYear = 2000;
            selectedElement = null;
            grabbedDown = false;
            errorState = [ErrorType.Okay, ErrorType.Okay, ErrorType.Okay, ErrorType.Okay, ErrorType.Okay, ErrorType.Okay]

            let url = baseURL + "/semester/id?sessionid=" + localStorage.getItem("sessionid") +
                "&id=" + localStorage.getItem("currentsid");


            //lese alle informationen über das aktuelle semester aus (start ende etc.)
            fetch(url).then(r => r.json()).then(s => {
                currentWeekStartDay = s.startday - new Date(s.startyear, 0, s.startday).getUTCDay();
                currentYear = s.startyear;
                //setze alle informationen für die kalender seitenansicht
                setStartYearCalenderSideBar(currentYear)
                setEndYearCalenderSideBar(s.endyear)
                setHighlightMonth(new Date(s.startyear, 0, s.startday).getMonth())
                setHighlightYear(currentYear)

                semesterStart = s.startday;
                semesterEnd = s.endday;
                //setze alle informationen für die kalender seitenansicht
                semesterStartYear = s.startyear;
                semesterEndYear = s.endyear;
                setStartDayCalenderSideBar(semesterStart)
                setEndDayCalenderSideBar(s.endday)

                //sollte alle semesterinformationen da und verteilt sein, lese zum ersten mal die termine für die aktuelle woche (semester start woche)
                //vom backend
            }).then(readEntries)

            //setze den scroll der kompontente auf ca. die mitte der ansicht
            scrollRef.current.scrollTop = 600;
            //blockiere das kontextmenü, damit es bei rechtsklickoperationen nicht stört
            window.addEventListener("contextmenu", (e) => (e.preventDefault()))

            //verwende einen keylistener für die resize funktionen der komponente mit der plus und minus taste
            window.addEventListener("keypress", (e) => {
                try {
                    //hierbei wird die cell height (ganz oben im script) angepasst und auf ein minimum limitiert.
                    //ein maximum gibt es nicht.
                    if (e.key === "+") {
                        cellHeight += 2
                    } else if (e.key === "-") {
                        if (cellHeight - 2 >= 8) {
                            cellHeight -= 2
                        }
                    }
                } catch (e) {

                }
            })


            //führe diese funktion parellel zum rest aus, damit alle 500ms die daten neu vom backend geladen werden (live sync)
            setInterval(function () {
                if (selectedElement == null) {
                    readEntries()
                }
            }, 500);
        }, 100)
    }, [])


    //rechnet das interne zeitformat 0-96 in lesbaren zeiten um
    function internal_to_time(internal) {
        internal -= 1
        internal /= 4
        let integer = Math.floor(internal)
        let decimal = internal.toFixed(2);
        let minutes = Math.floor((decimal - integer) * 60);
        let minutes_string = minutes.toString().length === 1 ? "0" + minutes : minutes
        return integer + ":" + minutes_string;
    }

    let temp = []
    for (let i = 2; i <= 96; i += 2) {
        temp.push(i);
    }

    //funktionalität in diesem komponente, sollte in der seitenansicht auf einen monat geklickt werden.
    function onMonthClick(monthIndex, startParts) {
        //berechne den neuen starttag in der woche, und lade alle benötigten daten neu.
        monthIndex--
        let startDay = 1
        let date = new Date(parseInt(startParts[2]), monthIndex, startDay);
        if(monthIndex + 1 == startParts[1] && startParts[0] != 1){
            startDay = startParts[0];
            date = new Date(parseInt(startParts[2]), monthIndex, startDay);
        }
        if(date.getDay() == 0){
            startDay = parseInt(startDay.toString()) + 1
            date = new Date(parseInt(startParts[2]), monthIndex, startDay);
        }
        let start = new Date(date.getFullYear(), 0, 0)
        currentWeekStartDay = Math.round((date - start) / (1000 * 60 * 60 * 24))
        currentWeekStartDay = currentWeekStartDay - new Date(date.getFullYear(), 0, currentWeekStartDay).getUTCDay()
        currentYear = date.getFullYear()
        setHighlightMonth(date.getMonth())
        setHighlightYear(currentYear)

        for (let i = 0; i < errorState.length; i++) {
            errorState[i] = ErrorType.Okay
        }

        //hole die daten für die neue woche vom backend erneut
        readEntries()
    }

    //sichtbarer html teil der komponente, im allgemeinen über flex layouts und div elemente realisiert. in jeder einzelnen tages-spalte
    //befindet sich allerdings ein grid layout mit der breite 1. In diesem werden die Termine angesiedelt
    return (

        <div style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center"
        }}>
            <PopUp displayState={popUpToggleAbgeben ? "block" : "none"} hint={"Willst du wirklich abgeben?"}
                   text1={"Abbrechen"} text2={"Abgeben"}
                   function1={() => {
                       setPopUpToggleAbgeben(false)
                   }}
                   function2={() => {
                       fetch(baseURL + "/module/submit?sessionid=" + localStorage.getItem("sessionid") + "&id=" + localStorage.getItem("moduleid"), {
                           method: "PUT"
                       }).then(() => router.push("/semesteroverviewLecturer"))
                   }}
            />
            
            <p style={{
                fontSize: 40,
                marginBottom: 60
            }}>{p.semesterName}</p>
            <div className={"calender-direction-wrapper"}>
                <div>
                    {/*füge hier die kalender seitenansicht ein links von der planungsansicht*/}
                    <BasicDateCalendar startyear={startYearCalenderSideBar} startday={startDayCalenderSideBar}
                                       endyear={endYearCalenderSideBar} endday={endDayCalenderSideBar}
                                       highlightYear={highlightYear} highlightMonth={highlightMonth}
                                       onMonthClick={onMonthClick}/>
                </div>
                <div style={{
                    display: "flex",
                    height: "73vh",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                }} id={update}>
                    {/*füge hier den wochenwechsler ein. Oberhalb der planungsansicht*/}
                    <WeekSelector year={currentYear} startday={currentWeekStartDay} onFunctionLeft={() => onWeekLeft()}
                                  onFunctionRight={() => onWeekRight()}/>
                    <div style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: "white",
                        gap: 5,
                    }}>
                        {/*hier wird die leiste für die namen der wochentage generiert*/}
                        <div style={{borderRadius: 10, padding: 10, backgroundColor: "#f1f1f1"}}
                             className={"box-shadow"}>
                            <div>
                                <div className={"wochen-tag-container"}>
                                    <div
                                        className={"wochen-tag font-big"}>Montag {new Date(currentYear, 0, currentWeekStartDay).getDate()}.
                                    </div>
                                    <div
                                        className={"wochen-tag font-big"}>Dienstag {new Date(currentYear, 0, currentWeekStartDay + 1).getDate()}.
                                    </div>
                                    <div
                                        className={"wochen-tag font-big"}>Mittwoch {new Date(currentYear, 0, currentWeekStartDay + 2).getDate()}.
                                    </div>
                                    <div
                                        className={"wochen-tag font-big"}>Donnerstag {new Date(currentYear, 0, currentWeekStartDay + 3).getDate()}.
                                    </div>
                                    <div
                                        className={"wochen-tag font-big"}>Freitag {new Date(currentYear, 0, currentWeekStartDay + 4).getDate()}.
                                    </div>
                                    <div
                                        className={"wochen-tag font-big"}>Samstag {new Date(currentYear, 0, currentWeekStartDay + 5).getDate()}.
                                    </div>
                                </div>
                            </div>
                            <div className={"calender-container"} ref={scrollRef}>

                                <div className={"calender-view content"} style={{height: cellHeight * 96 + 10}}>


                                    {/*hier die spalte für den montag*/}
                                    <div className={"spalte"}
                                         id={"0"} style={{
                                        gridTemplateRows: `repeat(96, ${cellHeight}px)`,
                                        backgroundColor: grayedOut[0] ? "#aaaaaa" : "#ffffff"
                                    }}
                                         // weise mausfunktionalitäten der spalte zu
                                         onMouseDown={e => onMouseDown(e)}
                                         onMouseMove={e => onMouseMove(e)}
                                         onMouseUp={e => onMouseUp(e)}>

                                        {/*füge die einträge dieses tages in das grid layout ein*/}
                                        {entries[0].map(d => (d != null && <div className={"entry"} style={{
                                            width: "100%",
                                            gridRowStart: d.timestart,
                                            gridRowEnd: d.timeend,
                                            backgroundColor: getEntryColor(d.usercreatedbyid, 0, d.semesterid, d.moduleid)
                                        }} id={d.id + "e"}>
                                            {/*hier die obere bar, an der termin gezogen werden kann*/}
                                            <div className={"resize-grab"} id={"grabup"} style={{
                                                backgroundColor: getResizeBarColor(d.usercreatedbyid, 0, d.semesterid, d.moduleid)
                                            }}></div>
                                            {/*hier der mittelteil des termins (zeitinfos usw.)*/}
                                            <div style={{maxHeight: "60%"}} className={"no-pointer-events"}>
                                                <p>{internal_to_time(d.timestart) + " - " + internal_to_time(d.timeend)}</p>
                                                <p>{d.info}</p>
                                                <br/>
                                                <p>{(Math.floor((d.timeend - d.timestart) / 12)) > 0 ? (Math.floor((d.timeend - d.timestart) / 12) * 15) + "min Pause einplanen" : ""}</p>
                                            </div>
                                            {/*hier die untere bar, an der termin gezogen werden kann*/}
                                            <div className={"resize-grab"} id={"grabdown"} style={{
                                                backgroundColor: getResizeBarColor(d.usercreatedbyid, 0, d.semesterid, d.moduleid)
                                            }}></div>
                                        </div>))}
                                    </div>

                                    {/*gleich wie montag, aber für dienstag*/}
                                    <div className={"spalte"}
                                         id={"1"} style={{
                                        gridTemplateRows: `repeat(96, ${cellHeight}px)`,
                                        backgroundColor: grayedOut[1] ? "#aaaaaa" : "#ffffff"
                                    }}
                                         onMouseDown={e => onMouseDown(e)}
                                         onMouseMove={e => onMouseMove(e)}
                                         onMouseUp={e => onMouseUp(e)}>

                                        {entries[1].map(d => (d != null && <div className={"entry"} style={{
                                            width: "100%",
                                            gridRowStart: d.timestart,
                                            gridRowEnd: d.timeend,
                                            backgroundColor: getEntryColor(d.usercreatedbyid, 1, d.semesterid, d.moduleid)
                                        }} id={d.id + "e"}>

                                            <div className={"resize-grab"} id={"grabup"} style={{
                                                backgroundColor: getResizeBarColor(d.usercreatedbyid, 1, d.semesterid, d.moduleid)
                                            }}></div>
                                            <div style={{maxHeight: "60%"}} className={"no-pointer-events"}>
                                                <p>{internal_to_time(d.timestart) + " - " + internal_to_time(d.timeend)}</p>
                                                <p>{d.info}</p>
                                                <br/>
                                                <p>{(Math.floor((d.timeend - d.timestart) / 12)) > 0 ? (Math.floor((d.timeend - d.timestart) / 12) * 15) + "min Pause einplanen" : ""}</p>
                                            </div>
                                            <div className={"resize-grab"} id={"grabdown"} style={{
                                                backgroundColor: getResizeBarColor(d.usercreatedbyid, 1, d.semesterid, d.moduleid)
                                            }}></div>
                                        </div>))}
                                    </div>


                                    {/*gleich wie montag aber für mittwoch*/}
                                    <div className={"spalte"}
                                         id={"2"} style={{
                                        gridTemplateRows: `repeat(96, ${cellHeight}px)`,
                                        backgroundColor: grayedOut[2] ? "#aaaaaa" : "#ffffff"
                                    }}
                                         onMouseDown={e => onMouseDown(e)}
                                         onMouseMove={e => onMouseMove(e)}
                                         onMouseUp={e => onMouseUp(e)}>


                                        {entries[2].map(d => (d != null && <div className={"entry"} style={{
                                            width: "100%",
                                            gridRowStart: d.timestart,
                                            gridRowEnd: d.timeend,
                                            backgroundColor: getEntryColor(d.usercreatedbyid, 2, d.semesterid, d.moduleid)
                                        }} id={d.id + "e"}>

                                            <div className={"resize-grab"} id={"grabup"} style={{
                                                backgroundColor: getResizeBarColor(d.usercreatedbyid, 2, d.semesterid, d.moduleid)
                                            }}></div>
                                            <div style={{maxHeight: "60%"}} className={"no-pointer-events"}>
                                                <p>{internal_to_time(d.timestart) + " - " + internal_to_time(d.timeend)}</p>
                                                <p>{d.info}</p>
                                                <br/>
                                                <p>{(Math.floor((d.timeend - d.timestart) / 12)) > 0 ? (Math.floor((d.timeend - d.timestart) / 12) * 15) + "min Pause einplanen" : ""}</p>
                                            </div>
                                            <div className={"resize-grab"} id={"grabdown"} style={{
                                                backgroundColor: getResizeBarColor(d.usercreatedbyid, 2, d.semesterid, d.moduleid)
                                            }}></div>
                                        </div>))}
                                    </div>

                                    {/*gleich wie montag*/}
                                    <div className={"spalte"}
                                         id={"3"} style={{
                                        gridTemplateRows: `repeat(96, ${cellHeight}px)`,
                                        backgroundColor: grayedOut[3] ? "#aaaaaa" : "#ffffff"
                                    }}
                                         onMouseDown={e => onMouseDown(e)}
                                         onMouseMove={e => onMouseMove(e)}
                                         onMouseUp={e => onMouseUp(e)}>

                                        {entries[3].map(d => (d != null && <div className={"entry"} style={{
                                            width: "100%",
                                            gridRowStart: d.timestart,
                                            gridRowEnd: d.timeend,
                                            backgroundColor: getEntryColor(d.usercreatedbyid, 3, d.semesterid, d.moduleid)
                                        }} id={d.id + "e"}>

                                            <div className={"resize-grab"} id={"grabup"} style={{
                                                backgroundColor: getResizeBarColor(d.usercreatedbyid, 3, d.semesterid, d.moduleid)
                                            }}></div>
                                            <div style={{maxHeight: "60%"}} className={"no-pointer-events"}>
                                                <p>{internal_to_time(d.timestart) + " - " + internal_to_time(d.timeend)}</p>
                                                <p>{d.info}</p>
                                                <br/>
                                                <p>{(Math.floor((d.timeend - d.timestart) / 12)) > 0 ? (Math.floor((d.timeend - d.timestart) / 12) * 15) + "min Pause einplanen" : ""}</p>
                                            </div>
                                            <div className={"resize-grab"} id={"grabdown"} style={{
                                                backgroundColor: getResizeBarColor(d.usercreatedbyid, 3, d.semesterid, d.moduleid)
                                            }}></div>
                                        </div>))}
                                    </div>

                                    {/*gleich wie montag*/}
                                    <div className={"spalte"}
                                         id={"4"} style={{
                                        gridTemplateRows: `repeat(96, ${cellHeight}px)`,
                                        backgroundColor: grayedOut[4] ? "#aaaaaa" : "#ffffff"
                                    }}
                                         onMouseDown={e => onMouseDown(e)}
                                         onMouseMove={e => onMouseMove(e)}
                                         onMouseUp={e => onMouseUp(e)}>


                                        {entries[4].map(d => (d != null && <div className={"entry"} style={{
                                            width: "100%",
                                            gridRowStart: d.timestart,
                                            gridRowEnd: d.timeend,
                                            backgroundColor: getEntryColor(d.usercreatedbyid, 4, d.semesterid, d.moduleid)
                                        }} id={d.id + "e"}>
                                            <div className={"resize-grab"} id={"grabup"} style={{
                                                backgroundColor: getResizeBarColor(d.usercreatedbyid, 4, d.semesterid, d.moduleid)
                                            }}></div>
                                            <div style={{maxHeight: "60%"}} className={"no-pointer-events"}>
                                                <p>{internal_to_time(d.timestart) + " - " + internal_to_time(d.timeend)}</p>
                                                <p>{d.info}</p>
                                                <br/>
                                                <p>{(Math.floor((d.timeend - d.timestart) / 12)) > 0 ? (Math.floor((d.timeend - d.timestart) / 12) * 15) + "min Pause einplanen" : ""}</p>
                                            </div>
                                            <div className={"resize-grab"} id={"grabdown"} style={{
                                                backgroundColor: getResizeBarColor(d.usercreatedbyid, 4, d.semesterid, d.moduleid)
                                            }}></div>
                                        </div>))}
                                    </div>

                                    {/*gleich wie montag*/}
                                    <div className={"spalte"}
                                         id={"5"} style={{
                                        gridTemplateRows: `repeat(96, ${cellHeight}px)`,
                                        backgroundColor: grayedOut[5] ? "#aaaaaa" : "#ffffff"
                                    }}
                                         onMouseDown={e => onMouseDown(e)}
                                         onMouseMove={e => onMouseMove(e)}
                                         onMouseUp={e => onMouseUp(e)}>


                                        {entries[5].map(d => (d != null && <div className={"entry"} style={{
                                            width: "100%",
                                            gridRowStart: d.timestart,
                                            gridRowEnd: d.timeend,
                                            backgroundColor: getEntryColor(d.usercreatedbyid, 5, d.semesterid, d.moduleid)
                                        }} id={d.id + "e"}>
                                            <div className={"resize-grab"} id={"grabup"} style={{
                                                backgroundColor: getResizeBarColor(d.usercreatedbyid, 5, d.semesterid, d.moduleid)
                                            }}></div>
                                            <div style={{maxHeight: "60%"}} className={"no-pointer-events"}>
                                                <p>{internal_to_time(d.timestart) + " - " + internal_to_time(d.timeend)}</p>
                                                <p>{d.info}</p>
                                                <br/>
                                                <p>{(Math.floor((d.timeend - d.timestart) / 12)) > 0 ? (Math.floor((d.timeend - d.timestart) / 12) * 15) + "min Pause einplanen" : ""}</p>
                                            </div>
                                            <div className={"resize-grab"} id={"grabdown"} style={{
                                                backgroundColor: getResizeBarColor(d.usercreatedbyid, 5, d.semesterid, d.moduleid)
                                            }}></div>
                                        </div>))}
                                    </div>
                                </div>


                                {/*hier ein zweites element, das über den eigentlichen terminen usw. liegt und dafür verantwortlich ist zeitstempel und trennlinen anzuzeigen*/}
                                <div className={"overlay"} style={{backgroundColor: "rgba(0, 0, 0, 0)"}}>
                                    {temp.map(i => (<div style={{
                                        width: "100%",
                                        height: cellHeight * 2,
                                        display: "flex",
                                        flexDirection: "row",
                                        justifyContent: "space-around",
                                        alignItems: "center",
                                    }} className={"no-pointer-events"}>
                                        {/*das div element ist für die linie*/}
                                        <div style={{
                                            borderBottom: (i / 4 === 7 || i / 4 === 18 ? "3px solid #fc3d03" : "1px solid #363636"),
                                        }}>
                                            {/*das p element ist für den zeitstempel*/}
                                            <p style={{
                                            color: "gray",
                                            marginTop: cellHeight - 3,
                                            marginRight: 120,
                                            fontSize: 12,
                                            textAlign: "center"
                                        }}>{internal_to_time(i + 1)}</p></div>

                                        <div style={{
                                            borderBottom: (i / 4 === 7 || i / 4 === 18 ? "3px solid #fc3d03" : "1px solid #363636"),
                                        }}><p style={{
                                            color: "gray",
                                            marginTop: cellHeight - 3,
                                            marginRight: 120,
                                            fontSize: 12,
                                            textAlign: "center"
                                        }}>{internal_to_time(i + 1)}</p></div>
                                        <div style={{
                                            borderBottom: (i / 4 === 7 || i / 4 === 18 ? "3px solid #fc3d03" : "1px solid #363636"),
                                        }}><p style={{
                                            color: "gray",
                                            marginTop: cellHeight - 3,
                                            marginRight: 120,
                                            fontSize: 12,
                                            textAlign: "center"
                                        }}>{internal_to_time(i + 1)}</p></div>
                                        <div style={{
                                            borderBottom: (i / 4 === 7 || i / 4 === 18 ? "3px solid #fc3d03" : "1px solid #363636"),
                                        }}><p style={{
                                            color: "gray",
                                            marginTop: cellHeight - 3,
                                            marginRight: 120,
                                            fontSize: 12,
                                            textAlign: "center"
                                        }}>{internal_to_time(i + 1)}</p></div>
                                        <div style={{
                                            borderBottom: (i / 4 === 7 || i / 4 === 18 ? "3px solid #fc3d03" : "1px solid #363636"),
                                        }}><p style={{
                                            color: "gray",
                                            marginTop: cellHeight - 3,
                                            marginRight: 120,
                                            fontSize: 12,
                                            textAlign: "center"
                                        }}>{internal_to_time(i + 1)}</p></div>
                                        <div style={{
                                            borderBottom: (i / 4 === 7 || i / 4 === 18 ? "3px solid #fc3d03" : "1px solid #363636"),
                                        }}><p style={{
                                            color: "gray",
                                            marginTop: cellHeight - 3,
                                            marginRight: 120,
                                            fontSize: 12,
                                            textAlign: "center"
                                        }}>{internal_to_time(i + 1)}</p></div>
                                    </div>))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/*die seitliche anzeige, welche die fehler anzeigt*/}
                <div className={"error-bar"}>
                    {/*iteriert über das array der fehlercodes und zeigt nur "fehler" bzw. warnungen an, die nicht gleich okay sind*/}
                    {errorState.map((e, index) => (
                        <div style={{
                            display: e === ErrorType.Okay ? "none" : "flex",
                            width: "90%",
                            backgroundColor: e === ErrorType.Okay ? "white" : "#e5a10e",
                            borderRadius: 15,
                            flexDirection: "column",
                            justifyContent: "center",
                            gap: 10,
                            alignItems: "center",
                            minHeight: 120,
                            maxHeight: 120,
                            padding: 10
                        }} className={"box-shadow"}>
                            <p style={{
                                borderRadius: 15,
                                backgroundColor: "#346991",
                                width: "90%",
                                paddingTop: 1,
                                paddingBottom: 1,
                                color: "white",
                                textAlign: "center"
                            }}>{new Date(currentYear, 0, currentWeekStartDay + index).toLocaleDateString()}</p>
                            <p style={{
                                textAlign: "center"
                            }}>{e}</p>
                        </div>))}
                </div>
            </div>

            {/*hier ein element, welches die oben berechneten verplanten vorlesungsstunden des dozenten anzeigt*/}
            <div className={"box-shadow round-border"} style={{
                marginTop: 30,
                padding: 5
            }}>
            <p style={{
                display: typeof window !== "undefined" && localStorage.getItem("admin") == 0 ? "block" : "none",
                fontSize: 20
            }}>{Math.floor(timePlanned)} Vorlesungsstunden {(Math.floor(timePlanned * 3) - Math.floor(Math.floor(timePlanned) * 3)) * 15} min
                // 20 Vorlesungsstunden</p>
            </div>

            <div style={{
                display: typeof window !== "undefined" && localStorage.getItem("admin") == 0 ? "block" : "none",
                position: "absolute",
                right: 70,
                bottom: 20,
            }}>
                {/*hier der button für das abgeben. dieser überprüft, ob schon 20 vorlesungsstunden verplant wurden*/}
                {/*diese 20 vorlesungsstunden könnten durch eine anbindung an andere systeme ersetzt werden (temporärer wert)*/}
                <Button color={timePlanned < 20 ? "#AAAAAA": "#77932b"} onClick={() => {
                    Math.floor(timePlanned) == 20 ? setPopUpToggleAbgeben(true) : {}
                }} text={"Abgeben"} width={100} height={40}/>
            </div>
        </div>
    )
}