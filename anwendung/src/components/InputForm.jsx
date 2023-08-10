import Button from "@/components/Button";
import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import Background from "@/components/Background";
import {baseURL} from "@/components/Constants";
import Back from "@/components/Back";

//dummy daten für die vorlesungsfächer
let modulesDummy = [
    ["Grundlagen u. Logik", "Programmieren 1", "Programmieren 2", "Digitaltechnik", "Web. Eng.", "Analysis"],
    ["Lineare Algebra", "Anwendungsprojekt", "BWL", "Projektmanagement", "Algo. Kompl.", "Python", "Prolog"],
    ["Software Eng. 1", "Netztechnik", "Betriebssysteme", "Rechnerarchitektur", "Systemnahe Progra.", "Algorithmen 2", "Stochastik", "Angewandte Mathe."],
    ["Software Eng. 2", "Datenbanken", "Compilerbau", "Automaten", "Formale Sprachen", "IT-Sicherheit", "IOT"],
    ["Software Eng. 3", "Datenbanken 2", ],
    ["Bachelor"]
]

//speichert ab, ob die nummer des semesters in der bearbeitung geändert wurde.
//wichtig umd daten (aus alten semester nummern) korrekt löschen zu können
let hasSemesterNumberChanged = false

export default function InputForm(p) {
    const [courseName, setCourseName] = useState("")
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [semesterNumber, setSemesterNumber] = useState(0)
    const [users, setUsers] = useState([])
    const [moduleUserMapping, setModuleUserMapping] = useState([])

    const router = useRouter()


    useEffect(() => {

        hasSemesterNumberChanged = false

        //lädt zu beginn alle dummy daten des ersten semesters
        let arr = []
        modulesDummy[0].map(e => {
            arr.push({"moduleid": -1, "userid": -1, "activated": 0})
        })
        setModuleUserMapping(arr)

        let url = baseURL + "/users/all?sessionid=" + localStorage.getItem("sessionid")
        //holt alle dozenten, die für das dozieren in fragen kommen.
        fetch(url).then(r => r.json()).then(u => {
            setUsers(u)
        }).then(() => {
            let tempSemesterNumber = 0
            //hier kann ausgemacht werden, ob ein semester neu erstellt werden soll oder bearbeitet, wenn 0 dann wird neu erstellt
            //also hier wird bearbeitet
            if(localStorage.getItem("currentsid") != 0)
            {
                //holen alle daten, die bis jetzt in diesem semester vorhanden sind (noch keine zuweisungen von dozenten zu vorlesungen)
                fetch(baseURL + "/semester/id?sessionid=" + localStorage.getItem("sessionid") + "&id=" + localStorage.getItem("currentsid")).then(r => r.json()).then(semester => {
                    setCourseName(semester.name)
                    let startYear = semester.startyear
                    let endYear = semester.endyear
                    let start = new Date(startYear, 0, semester.startday)
                    let end = new Date(endYear, 0, semester.endday)

                    setStartDate(startYear + "-" + ((start.getMonth() + 1) < 10 ? "0" + (start.getMonth() + 1) : (start.getMonth() + 1))  + "-" + (start.getDate() < 10 ? "0" + start.getDate() : start.getDate()))
                    setEndDate(endYear + "-" + ((end.getMonth() + 1) < 10 ? "0" + (end.getMonth() + 1) : (end.getMonth() + 1)) + "-" + (end.getDate() < 10 ? "0" + end.getDate() : end.getDate()))

                    tempSemesterNumber = semester.number
                    setSemesterNumber(semester.number)

                    arr = []
                    modulesDummy[semester.number].map(e => {
                        arr.push({"moduleid": -1, "userid": -1, "activated": 0})
                    })

                }).then(() => {
                    //hole alle zuweisungen von dozenten zu vorlesungen / fächern innerhalb dieses semesters.
                    fetch(baseURL + "/module/bysemesterid?sessionid=" + localStorage.getItem("sessionid") + "&semesterid=" + localStorage.getItem("currentsid")).then(r => r.json()).then(modules => {
                        console.log(modules)
                        for(let i = 0; i < modules.length; i++)
                        {
                            for(let j = 0; j < modulesDummy[tempSemesterNumber].length; j++)
                            {
                                if(modulesDummy[tempSemesterNumber][j] == modules[i].name)
                                {
                                    arr[j].userid = modules[i].userid
                                    arr[j].moduleid = modules[i].id
                                    arr[j].activated = modules[i].activated
                                    break
                                }
                            }
                        }

                        setModuleUserMapping(arr)
                    })
                })
            }
        })
    }, [])

    //sollte auf abbrechen geklickt worden sein...
    function onButtonAbort(e) {
        router.back()
    }

    //sollte auf speichern geklickt worden sein... hier werden nur daten des semesters übermittelt, noch nicht die
    //zweisungen von dozenten und vorlesungen / modulen
    function onButtonSave(e) {

        //bereite alle relevanten daten des input form auf
        let semesterid = localStorage.getItem("currentsid")

        let startYear = parseInt(startDate.split("-")[0])
        let endYear = parseInt(endDate.split("-")[0])

        let start = new Date(startYear, parseInt(startDate.split("-")[1]) - 1, parseInt(startDate.split("-")[2]))
        let end = new Date(endYear, parseInt(endDate.split("-")[1]) - 1, parseInt(endDate.split("-")[2]))

        let startDayInYear = Math.round((start - new Date(startYear, 0, 0)) / (1000 * 60 * 60 * 24))
        let endDayInYear = Math.round((end - new Date(endYear, 0, 0)) / (1000 * 60 * 60 * 24))

        //wenn das semester neu erstellt werden soll, sende eine post anfrage and das backend.
        if(semesterid == 0)
        {
            fetch(baseURL + "/semester?sessionid=" + localStorage.getItem("sessionid"), {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    "id": 0,
                    "startday": startDayInYear,
                    "endday": endDayInYear,
                    "name": courseName,
                    "startyear": startYear,
                    "endyear": endYear,
                    "number": semesterNumber
                })
            }).then(r => r.json()).then(semester => {semesterid = semester.id}).then(() => modulesInBackend(semesterid))
        }
        //wenn das semester nur editiert wurde, stelle eine put anfrage an das backend.
        else
        {
            fetch(baseURL + "/semester?sessionid=" + localStorage.getItem("sessionid"), {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    "id": semesterid,
                    "startday": startDayInYear,
                    "endday": endDayInYear,
                    "name": courseName,
                    "startyear": startYear,
                    "endyear": endYear,
                    "number": semesterNumber
                })
            }).then(() => modulesInBackend(semesterid))
        }
    }

    function modulesInBackend(semesterid)
    {
        //sollte sich die nummer des semesters geändert haben, lösche alle alten zuweisungen von dozenten und modulen aus dem backend.
        if (hasSemesterNumberChanged) {
            fetch(baseURL + "/module/bysemesterid?sessionid=" + localStorage.getItem("sessionid") + "&id=" + localStorage.getItem("currentsid"), {
                method: "DELETE"
            }).then(() => {
                for (let i = 0; i < moduleUserMapping.length; i++) {
                    let current = moduleUserMapping[i]
                    if (current.userid != -1) {
                        if (current.moduleid == -1) {
                            fetch(baseURL + "/module?sessionid=" + localStorage.getItem("sessionid"), {
                                method: "POST",
                                headers: {"Content-Type": "application/json"},
                                body: JSON.stringify({
                                    "id": 0,
                                    "userid": current.userid,
                                    "semesterid": semesterid,
                                    "name": modulesDummy[semesterNumber][i],
                                    "activated": current.activated
                                })
                            })
                        }
                    }
                }
            })
        } else {

            //hier werden modulzuweisungen zu dozenten am backend aktualisiert
            for (let i = 0; i < moduleUserMapping.length; i++) {
                let current = moduleUserMapping[i]
                //solte die zuweisung des modules zum dozenten noch aktiv sein...
                if (current.userid != -1) {
                    //im fall, dass das die zuweisung nocht nie existiert hat, stelle eine post anfrage
                    if (current.moduleid == -1) {
                        fetch(baseURL + "/module?sessionid=" + localStorage.getItem("sessionid"), {
                            method: "POST",
                            headers: {"Content-Type": "application/json"},
                            body: JSON.stringify({
                                "id": 0,
                                "userid": current.userid,
                                "semesterid": semesterid,
                                "name": modulesDummy[semesterNumber][i],
                                "activated": current.activated
                            })
                        })
                    } else {
                        //im fall, dass die zuweisung schon existiert hat aber nur geändert wurde, stelle eine PUT anfrage
                        fetch(baseURL + "/module?sessionid=" + localStorage.getItem("sessionid"), {
                            method: "PUT",
                            headers: {"Content-Type": "application/json"},
                            body: JSON.stringify({
                                "id": current.moduleid,
                                "userid": current.userid,
                                "semesterid": 0,
                                "name": "",
                                "activated": current.activated
                            })
                        })
                    }
                    //.. ist diese zuweisung nicht mehr aktiv, lösche die zuweisung aus dem backend.
                } else {
                    if (current.moduleid != -1) {
                        fetch(baseURL + "/module?sessionid=" + localStorage.getItem("sessionid") + "&id=" + current.moduleid, {
                            method: "DELETE"
                        })
                    }
                }
            }
        }

        //gehe nach dem speichern zurück auf das dashboard
        router.back()
    }

    return (
        <>
            {/*das hintergrundbild*/}
            <Background/>
            <div className={"box-shadow input-form round-border"}>

                {/*grundlegende input forms für namen... semesternummer usw.*/}
                <p>Kursname</p>
                <input type={"text"} className={"box-shadow round-border"}
                       style={{padding: 8, width: "100%", backgroundColor: (courseName == "") ? "#E44747" : "white"}}
                       onChange={(e) => {
                           setCourseName(e.target.value)
                       }} value={courseName}/>

                <div style={{display: "flex", justifyContent: "flex-start", gap: 40}}>
                    <p>Theorie Anfang</p>
                    <p>Theorie Ende</p>
                </div>
                <div style={{display: "flex", justifyContent: "flex-start", gap: 20}}>
                    <input type={"date"} className={"box-shadow round-border"} style={{
                        padding: 8, backgroundColor: (startDate == "" || startDate >= endDate) ? "#E44747" : "white"
                    }} value={startDate} onChange={e => {
                        setStartDate(e.target.value)
                    }}/>
                    <input type={"date"} className={"box-shadow round-border"} style={{
                        padding: 8, backgroundColor: (endDate == "" || startDate >= endDate) ? "#E44747" : "white"
                    }} value={endDate} onChange={e => {
                        setEndDate(e.target.value)
                    }}/>
                </div>

                <p>Semester Wählen</p>
                <select className={"round-border box-shadow"} style={{padding: 5, width: "27%"}} value={semesterNumber}
                        onChange={e => {
                            setSemesterNumber(e.target.value)
                            let arr = []
                            modulesDummy[e.target.value].map(e => {
                                arr.push({"moduleid": -1, "userid": -1, "activated": 0})
                            })
                            setModuleUserMapping(arr)
                            hasSemesterNumberChanged = true
                        }}>
                    <option value={0}>1. Semester</option>
                    <option value={1}>2. Semester</option>
                    <option value={2}>3. Semester</option>
                    <option value={3}>4. Semester</option>
                    <option value={4}>5. Semester</option>
                    <option value={5}>6. Semester</option>
                </select>

                {/*hier die tabelle, die alle zuweisungen von dozenten und modulen / vorlesungen anzeigt*/}
                <div className={"table-wrapper"}>
                    <table>
                        <tbody>
                        <tr>
                            <th>Freischalten</th>
                            <th>Modul</th>
                            <th>Dozent</th>
                        </tr>
                        {
                            modulesDummy[semesterNumber].map((module, index) => (
                                <tr style={{height: 50}}>
                                    <td>
                                        <input type={"checkbox"}
                                               checked={index < moduleUserMapping.length && moduleUserMapping[index].activated == 1}
                                               onChange={e => {
                                                   let arr = moduleUserMapping.slice()
                                                   arr[index].activated = e.target.checked ? 1 : 0
                                                   setModuleUserMapping(arr)
                                               }
                                               }></input>
                                    </td>
                                    <td>
                                        <p style={{fontWeight: "normal"}}>{module}</p>
                                    </td>

                                    <td>
                                        <select className={"box-shadow round-border"} style={{padding: 5}}
                                                onChange={e => {

                                                    let arr = moduleUserMapping.slice()
                                                    arr[index].userid = e.target.value
                                                    setModuleUserMapping(arr)
                                                    console.log(moduleUserMapping)
                                                }}
                                                value={index < moduleUserMapping.length && moduleUserMapping[index].userid}>
                                            <option value={-1}>-</option>
                                            {users.map(user => (
                                                <option value={user.id}>{user.firstName} {user.lastName}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))
                        }
                        </tbody>
                    </table>
                </div>

                <div style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    width: "100%",
                    gap: 10
                }}>
                    {/*hier die knöpfe abbrechen und speichern mit einer kleinen validierung, ob die grundlegen semesterdaten angegeben wurden*/}
                    <Button text={"Abbrechen"} onClick={onButtonAbort}/>
                    <Button text={"Speichern"} color={"#77932b"} onClick={() => {
                        (startDate == "" || endDate == "" || startDate >= endDate || courseName == "") ? () => {
                        } : onButtonSave()
                    }}/>
                </div>
            </div>
        </>
    )
}