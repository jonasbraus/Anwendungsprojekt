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

let cellHeight = 20;

let colors = ["#f80000", "#414141"]

let semesterStart;
let semesterEnd;
let currentWeekStartDay;
let currentYear;
let semesterStartYear;
let semesterEndYear;
let selectedElement;
let lastEndTimeDrag;
let lastStartTimeDrag;
let grabbedDown;

let isDayOkay = [true, true, true, true, true, true]

let errorState = [ErrorType.Okay, ErrorType.Okay, ErrorType.Okay, ErrorType.Okay, ErrorType.Okay, ErrorType.Okay]
let grayedOut = [false, false, false, false, false, false]

let timePlanned = 0

export default function CalenderView(p) {

    const [entries, setEntries] = useState([[], [], [], [], [], []])
    const [update, setUpdate] = useState(false)
    const scrollRef = useRef(null);

    const [startDayCalenderSideBar, setStartDayCalenderSideBar] = useState(0)
    const [startYearCalenderSideBar, setStartYearCalenderSideBar] = useState(2000)
    const [endDayCalenderSideBar, setEndDayCalenderSideBar] = useState(0)
    const [endYearCalenderSideBar, setEndYearCalenderSideBar] = useState(2000)
    const [highlightMonth, setHighlightMonth] = useState(0)
    const [highlightYear, setHighlightYear] = useState(2000)
    const [popUpToggleAbgeben, setPopUpToggleAbgeben] = useState(false)
    const router = useRouter();


    function readEntries() {
        let url = baseURL + "/entries?semesterid=" + localStorage.getItem("currentsid") +
            "&daynumber=" + currentWeekStartDay + "&yearnumber=" + currentYear + "&sessionid=" + localStorage.getItem("sessionid");
        let currentsid = localStorage.getItem("currentsid")
        let userid = localStorage.getItem("userid")

        try {
            fetch(url).then(r => r.json()).then(en => {


                for (let i = 0; i < en.length; i++) {
                    isDayOkay[i] = true
                    let maxLunchBreak = 0
                    let daySum = 0
                    for (let j = 0; j < en[i].length; j++) {
                        if (en[i][j] != null && currentsid == (en[i][j]).semesterid) {
                            let elem = en[i][j]

                            if ((elem.timestart - 1) / 4 < 8) {
                                errorState[i] = ErrorType.TooEarly
                                isDayOkay[i] = false
                                break
                            } else if ((elem.timeend - 1) / 4 > 17) {
                                errorState[i] = ErrorType.TooLate
                                isDayOkay[i] = false
                                break
                            } else if (new Date(currentYear, 0, elem.daynumber).getUTCDay() === 5) {
                                errorState[i] = ErrorType.Saturday
                                isDayOkay[i] = false
                            } else {
                                if ((elem.timestart - 1) / 4 <= 11 && (elem.timeend - 1) / 4 >= 14) {
                                    errorState[i] = ErrorType.NotEnoughLunchTime
                                    isDayOkay[i] = false
                                    break
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

                                errorState[i] = ErrorType.Okay
                            }

                            daySum += elem.timeend - elem.timestart
                        }
                    }

                    if (daySum / 4 > 8) {
                        errorState[i] = ErrorType.TooLong
                        isDayOkay[i] = false
                    }
                }

                for (let i = 0; i < 6; i++) {
                    for (let k = 0; k < 20; k++) {
                        if (en[i][k] != null) {


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

                let j = 0;
                for (let i = Math.round(((new Date(currentYear, 0, currentWeekStartDay) - new Date(currentYear, 0, 0)) / (1000 * 60 * 60 * 24))); i <= Math.round(((new Date(currentYear, 0, currentWeekStartDay + 5) - new Date(currentYear, 0, 0)) / (1000 * 60 * 60 * 24))); i++) {
                    grayedOut[j] = i % Math.round(((new Date(currentYear, 11, 31) - new Date(currentYear, 0, 0)) / (1000 * 60 * 60 * 24))) < semesterStart && semesterEnd && new Date(currentYear, 0, currentWeekStartDay + j).getFullYear() == semesterStartYear || i % Math.round(((new Date(currentYear, 11, 31) - new Date(currentYear, 0, 0)) / (1000 * 60 * 60 * 24))) > semesterEnd && new Date(currentYear, 0, currentWeekStartDay + j).getFullYear() == semesterEndYear
                    j++
                }
                for (let i = 0; i < 6; i++) {
                    let date = new Date(currentYear, 0, currentWeekStartDay + i)
                    grayedOut[i] = holiday(currentYear, date.getMonth(), date.getDate()) ? holiday(currentYear, date.getMonth(), date.getDate()) : grayedOut[i]
                }

                setEntries(en)

                if(localStorage.getItem("admin") == 0)
                {
                    let entriesURL = baseURL + "/entries/all/module?sessionid=" + localStorage.getItem("sessionid") + "&moduleid=" + localStorage.getItem("moduleid")
                    fetch(entriesURL).then(r => r.json()).then(allEn => {

                        let moduleid = localStorage.getItem("moduleid")
                        let sum = 0

                        for (let j = 0; j < allEn.length; j++) {
                            if (allEn[j] != null && allEn[j].moduleid == moduleid) {
                                sum += allEn[j].timeend - allEn[j].timestart
                            }

                        }

                        sum /= 3
                        timePlanned = sum
                    })
                }
            })
        } catch (e) {

        }
    }

    function pushEntry(currentColumnID, row) {
        let url = baseURL + "/entries" + "?sessionid=" + localStorage.getItem("sessionid")
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
            readEntries()
        })
    }

    function deleteEntry(id) {
        let url = baseURL + "/entries?id=" + id + "&sessionid=" + localStorage.getItem("sessionid");
        fetch(url, {
            method: "DELETE"
        }).then(r => readEntries())
    }

    function holiday(year, month, day) {
        var feiertagejs = require('feiertagejs');
        let today = new Date(year, month, day)
        return feiertagejs.isHoliday(today, 'BW')
    }

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

    function onMouseUp(e) {
        if (selectedElement != null) {
            let id = selectedElement.id;

            if ((selectedElement.timestart - 1) / 4 >= 7 && (selectedElement.timeend - 1) / 4 <= 18) {

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
                    readEntries()
                })
            }

            selectedElement = null;
        }
    }

    function onMouseMove(e) {
        if (selectedElement != null) {
            let y_window = e.clientY;
            let y_target_offset = e.currentTarget.getBoundingClientRect().top;
            let row = Math.floor((y_window - y_target_offset) / cellHeight) + 1;
            let currentColumnID = parseInt(e.currentTarget.id)

            if (grabbedDown) {
                if (row - 1 > selectedElement.timestart) {

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

                    if (free) {
                        selectedElement.timeend = row + 1;
                    }
                }
            } else if (row + 2 < selectedElement.timeend) {
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
        let y_window = e.clientY;
        let y_target_offset = e.currentTarget.getBoundingClientRect().top;
        let row = Math.floor((y_window - y_target_offset) / cellHeight) + 1;
        let currentColumnID = parseInt(e.currentTarget.id)
        let currentId = e.target.id;
        let currentUserID = localStorage.getItem("userid");
        let currentsid = localStorage.getItem("currentsid")

        if (e.button === 0) {
            if (!currentId.includes("e")) {
                if (!currentId.includes("grab")) {
                    if (!checkForElementAtRow(row + 2, currentColumnID) && !checkForElementAtRow(row + 1, currentColumnID)) {
                        if ((row - 1) / 4 >= 7 && (row + 2) / 4 <= 18) {
                            if (!grayedOut[currentColumnID] && timePlanned + 0.8 < 20) {
                                pushEntry(currentColumnID, row)
                            }
                        }
                    }
                } else {
                    let parentID = parseInt(e.target.parentElement.id.replace("e", ""));
                    if (currentUserID == getElementInColumn(parentID, currentColumnID).usercreatedbyid && getElementInColumn(parentID, currentColumnID).moduleid == localStorage.getItem("moduleid")) {
                        grabbedDown = currentId.includes("down")
                        selectedElement = getElementInColumn(parentID, currentColumnID);
                        lastEndTimeDrag = selectedElement.timeend
                        lastStartTimeDrag = selectedElement.timestart
                    }
                }
            }
        } else if (e.button === 2) {
            let parentID = parseInt(e.target.id.replace("e", ""));
            if (currentUserID == getElementInColumn(parentID, currentColumnID).usercreatedbyid && currentId.includes("e") && getElementInColumn(parentID, currentColumnID).moduleid == localStorage.getItem("moduleid")) {
                let id = parseInt(currentId.replace("e", ""))
                errorState[currentColumnID] = ErrorType.Okay
                deleteEntry(id)
            }
        }
    }

    function onWeekLeft() {
        currentWeekStartDay -= 7;
        let date = new Date(currentYear, 0, currentWeekStartDay + 5)
        setHighlightMonth(date.getMonth())
        setHighlightYear(date.getFullYear())

        for (let i = 0; i < errorState.length; i++) {
            errorState[i] = ErrorType.Okay
        }

        readEntries()
    }

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

    function getEntryColor(userCreatedByID, columnID, semesterid, moduleid) {
        let id = localStorage.getItem("userid");
        let currentsid = localStorage.getItem("currentsid")
        if(localStorage.getItem("admin") == 0)
        {
            if (id == userCreatedByID) {
                if (isDayOkay[columnID] && moduleid == localStorage.getItem("moduleid")) {
                    return "#77932b";
                } else if (moduleid != localStorage.getItem("moduleid")) {
                    return "#346991";
                } else {
                    return "#e5a10e";
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

    useEffect(() => {
        setTimeout(() => {
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


            fetch(url).then(r => r.json()).then(s => {
                currentWeekStartDay = s.startday - new Date(s.startyear, 0, s.startday).getUTCDay();
                currentYear = s.startyear;
                setStartYearCalenderSideBar(currentYear)
                setEndYearCalenderSideBar(s.endyear)
                setHighlightMonth(new Date(s.startyear, 0, s.startday).getMonth())
                setHighlightYear(currentYear)

                semesterStart = s.startday;
                semesterEnd = s.endday;
                semesterStartYear = s.startyear;
                semesterEndYear = s.endyear;
                setStartDayCalenderSideBar(semesterStart)
                setEndDayCalenderSideBar(s.endday)

            }).then(readEntries)

            scrollRef.current.scrollTop = 600;
            window.addEventListener("contextmenu", (e) => (e.preventDefault()))

            window.addEventListener("keypress", (e) => {
                try {
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


            setInterval(function () {
                if (selectedElement == null) {
                    readEntries()
                }
            }, 500);
        }, 100)
    }, [])


    //returns internal format (0 - 96) to a string
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

    function onMonthClick(monthIndex, startParts) {
        monthIndex--
        let date = new Date(parseInt(startParts[2]), monthIndex, 1)
        let start = new Date(date.getFullYear(), 0, 0)
        currentWeekStartDay = Math.round((date - start) / (1000 * 60 * 60 * 24))
        currentWeekStartDay = currentWeekStartDay - new Date(date.getFullYear(), 0, currentWeekStartDay).getUTCDay()
        currentYear = date.getFullYear()
        setHighlightMonth(date.getMonth())
        setHighlightYear(currentYear)

        for (let i = 0; i < errorState.length; i++) {
            errorState[i] = ErrorType.Okay
        }

        readEntries()
    }

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


                                    <div className={"spalte"}
                                         id={"0"} style={{
                                        gridTemplateRows: `repeat(96, ${cellHeight}px)`,
                                        backgroundColor: grayedOut[0] ? "#aaaaaa" : "#ffffff"
                                    }}
                                         onMouseDown={e => onMouseDown(e)}
                                         onMouseMove={e => onMouseMove(e)}
                                         onMouseUp={e => onMouseUp(e)}>

                                        {entries[0].map(d => (d != null && <div className={"entry"} style={{
                                            width: "100%",
                                            gridRowStart: d.timestart,
                                            gridRowEnd: d.timeend,
                                            backgroundColor: getEntryColor(d.usercreatedbyid, 0, d.semesterid, d.moduleid)
                                        }} id={d.id + "e"}>
                                            <div className={"resize-grab"} id={"grabup"} style={{
                                                backgroundColor: getResizeBarColor(d.usercreatedbyid, 0, d.semesterid, d.moduleid)
                                            }}></div>
                                            <div style={{maxHeight: "60%"}} className={"no-pointer-events"}>
                                                <p>{internal_to_time(d.timestart) + " - " + internal_to_time(d.timeend)}</p>
                                                <p>{d.info}</p>
                                            </div>
                                            <div className={"resize-grab"} id={"grabdown"} style={{
                                                backgroundColor: getResizeBarColor(d.usercreatedbyid, 0, d.semesterid, d.moduleid)
                                            }}></div>
                                        </div>))}
                                    </div>


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
                                            </div>
                                            <div className={"resize-grab"} id={"grabdown"} style={{
                                                backgroundColor: getResizeBarColor(d.usercreatedbyid, 1, d.semesterid, d.moduleid)
                                            }}></div>
                                        </div>))}
                                    </div>


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
                                            </div>
                                            <div className={"resize-grab"} id={"grabdown"} style={{
                                                backgroundColor: getResizeBarColor(d.usercreatedbyid, 2, d.semesterid, d.moduleid)
                                            }}></div>
                                        </div>))}
                                    </div>


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
                                            </div>
                                            <div className={"resize-grab"} id={"grabdown"} style={{
                                                backgroundColor: getResizeBarColor(d.usercreatedbyid, 3, d.semesterid, d.moduleid)
                                            }}></div>
                                        </div>))}
                                    </div>


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
                                            </div>
                                            <div className={"resize-grab"} id={"grabdown"} style={{
                                                backgroundColor: getResizeBarColor(d.usercreatedbyid, 4, d.semesterid, d.moduleid)
                                            }}></div>
                                        </div>))}
                                    </div>


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
                                            </div>
                                            <div className={"resize-grab"} id={"grabdown"} style={{
                                                backgroundColor: getResizeBarColor(d.usercreatedbyid, 5, d.semesterid, d.moduleid)
                                            }}></div>
                                        </div>))}
                                    </div>
                                </div>


                                <div className={"overlay"} style={{backgroundColor: "rgba(0, 0, 0, 0)"}}>
                                    {/*maps a list of internal time stamps to lines and time stamps*/}
                                    {temp.map(i => (<div style={{
                                        width: "100%",
                                        height: cellHeight * 2,
                                        display: "flex",
                                        flexDirection: "row",
                                        justifyContent: "space-around",
                                        alignItems: "center",
                                    }} className={"no-pointer-events"}>
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
                <div className={"error-bar"}>
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

            <p style={{
                display: typeof window !== "undefined" && localStorage.getItem("admin") == 0 ? "block" : "none",
                marginTop: 10,
                fontSize: 20
            }}>{Math.floor(timePlanned)}h {(Math.floor(timePlanned * 3) - Math.floor(Math.floor(timePlanned) * 3)) * 15} min
                // 20h</p>

            <div style={{
                display: typeof window !== "undefined" && localStorage.getItem("admin") == 0 ? "block" : "none",
                position: "absolute",
                right: 70,
                bottom: 20,
            }}>
                <Button color={timePlanned < 20 ? "#AAAAAA": "#77932b"} onClick={() => {
                    Math.floor(timePlanned) == 20 ? setPopUpToggleAbgeben(true) : {}
                }} text={"Abgeben"} width={100} height={40}/>
            </div>
        </div>
    )
}