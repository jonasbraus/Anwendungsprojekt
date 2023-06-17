import Button from "@/components/Button";
import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import Background from "@/components/Background";
import {baseURL} from "@/components/Constants";
import Back from "@/components/Back";

let modulesDummy = [
    ["Analysis", "Theo Inf 1"],
    ["Lineare Algebra", "Anwendungsprojekt"],
    ["Theo Inf 3", "Software Eng"],
    ["Security", "BWL"],
    ["Software Eng", "Security"],
    ["Studienarbeit", "Bachelor"]
]

let tempSemesterNumber = 0
let update = false

let baseMapping = []

export default function InputForm(p) {

    const [startDate, setStartDate] = useState("0000-00-00")
    const [endDate, setEndDate] = useState("0000-00-00")
    const [courseName, setCourseName] = useState("")
    const [semesterNumber, setSemesterNumber] = useState(0)
    const [users, setUsers] = useState([])
    const [modulesSelectorValues, setModulesSelectorValues] = useState(["nothing", "nothing"])
    const [userModulesMapping, setUserModulesMapping] = useState({})
    const [isChecked, setIsChecked] = useState([])
    const [isActivated, setIsActivated] = useState([])
    const router = useRouter()

    useEffect(() => {

        setTimeout(() => {
            update = false;
            baseMapping = []

            let base = baseURL + "/semester/id?sessionid=" + localStorage.getItem("sessionid") + "&id=" + localStorage.getItem("currentsid")
            fetch(base).then(r => r.json()).then(j => {

                tempSemesterNumber = j.number
                setSemesterNumber(j.number)


                setCourseName(j.name)

                let tempStartDate = new Date(parseInt(j.startyear), 0, parseInt(j.startday))
                let tempEndDate = new Date(parseInt(j.endyear), 0, parseInt(j.endday))

                setStartDate(tempStartDate.getFullYear() + "-" + ((tempStartDate.getMonth() + 1).toString().padStart(2, "0")) + "-" + tempStartDate.getDate().toString().padStart(2, "0"))
                setEndDate(tempEndDate.getFullYear() + "-" + ((tempEndDate.getMonth() + 1).toString().padStart(2, "0")) + "-" + tempEndDate.getDate().toString().padStart(2, "0"))
            }).then(() => {
                readModules()
                update = true
            }).catch(() => readModules())
        }, 100)


    }, [])

    function readModules() {
        let usersTemp = []

        let userURL = baseURL + "/users/all?sessionid=" + localStorage.getItem("sessionid")
        fetch(userURL).then(r => r.json()).then(j => {
            setUsers(j)
            usersTemp = j
            let temp = [false, false, false]
            let temp2 = []
            for (let i = 0; i < j.length; i++) {
                temp.push(false)
                temp2.push(false)
            }
            setIsChecked(temp)
            setIsActivated(temp2)
        }).then(() => {
            let modulesURL = baseURL + "/module/bysemesterid?sessionid=" + localStorage.getItem("sessionid") + "&semesterid=" + localStorage.getItem("currentsid");
            fetch(modulesURL).then(r => r.json()).then(j => {

                setUserModulesMapping(j)
                baseMapping = j

                let temp = isChecked.slice()
                let temp2 = isActivated.slice()

                for (let i = 0; i < usersTemp.length; i++) {
                    let currentUser = usersTemp[i]

                    let found = false
                    let foundModuleLast = null
                    for (let f = 0; f < j.length; f++) {
                        let currentModule = j[f]

                        if (currentModule.userid === currentUser.id) {
                            found = true
                            foundModuleLast = currentModule
                        }
                    }

                    if (found) {
                        temp[i] = true

                        temp2[i] = foundModuleLast.activated === 1
                    }
                }

                setIsChecked(temp)
                setIsActivated(temp2)
            }).then(() => {
                setModulesSelectorValues(modulesDummy[tempSemesterNumber])
            })
        })
    }

    function onCourseNameChange(e) {
        setCourseName(e.target.value)
    }

    function onStartDateChange(e) {
        setStartDate(e.target.value)
    }

    function onEndDateChange(e) {
        setEndDate(e.target.value)
    }

    function onSemesterNumberChange(e) {
        setSemesterNumber(e.target.value)
        setModulesSelectorValues(modulesDummy[e.target.value])
    }

    function isOptionSelected(e, userid) {
        let found = false;

        for (let i = 0; i < userModulesMapping.length; i++) {
            let current = userModulesMapping[i]
            if (current.name === e && current.userid === userid) {
                found = true;
            }
        }


        return found;
    }

    function onCheckedChange(e, index) {
        let temp = isChecked.slice()
        temp[index] = e.target.checked
        setIsChecked(temp)

        if (!e.target.checked) {
            let temp = []
            let currentUser = users[index]
            for (let j = 0; j < userModulesMapping.length; j++) {
                if (userModulesMapping[j].userid !== currentUser.id) {
                    temp.push(userModulesMapping[j])
                }
            }

            setUserModulesMapping(temp)
        }
    }

    function onActivatedChange(e, index) {

        let temp = isActivated.slice()
        temp[index] = e.target.checked
        setIsActivated(temp)

        let userid = users[index].id

        for (let j = 0; j < userModulesMapping.length; j++) {
            if (userModulesMapping[j].userid === userid) {
                userModulesMapping[j].activated = e.target.checked ? 1 : 0
            }
        }
    }

    function onModuleSelectionChange(e, index) {
        let userid = users[index].id

        let newMapping = []
        let oldNamesIds = new Map()

        for (let j = 0; j < userModulesMapping.length; j++) {
            let currentModuleMapping = userModulesMapping[j]
            if (currentModuleMapping.userid != userid) {
                newMapping.push(currentModuleMapping)
            } else {
                oldNamesIds.set(currentModuleMapping.name, currentModuleMapping.id)
            }
        }

        let found = false
        for (let i = 0; i < e.target.options.length; i++) {

            let currentOption = e.target.options[i]
            if (currentOption.selected) {
                found = true

                newMapping.push({
                    "id": oldNamesIds.has(currentOption.value) ? oldNamesIds.get(currentOption.value) : -1,
                    "userid": userid,
                    "semesterid": -1,
                    "name": currentOption.value,
                    "activated": isActivated[index] ? 1 : 0
                })
            }
        }

        let temp = isChecked.slice()
        temp[index] = found
        setIsChecked(temp)

        setUserModulesMapping(newMapping)
    }

    function onButtonAbort() {
        router.back()
    }

    function onButtonSave() {
        let tempDateStart = new Date(parseInt(startDate.split("-")[0]), parseInt(startDate.split("-")[1]) - 1, parseInt(startDate.split("-")[2]))
        let tempDateEnd = new Date(parseInt(endDate.split("-")[0]), parseInt(endDate.split("-")[1]) - 1, parseInt(endDate.split("-")[2]))

        let startDayInYear = Math.round((tempDateStart - new Date(tempDateStart.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24))
        let endDayInYear = Math.round((tempDateEnd - new Date(tempDateEnd.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24))


        let semesterJson = {
            "id": update ? localStorage.getItem("currentsid") : 0,
            "startday": startDayInYear,
            "endday": endDayInYear,
            "name": courseName,
            "startyear": tempDateStart.getFullYear(),
            "endyear": tempDateEnd.getFullYear(),
            "number": semesterNumber
        }

        fetch(baseURL + "/semester?sessionid=" + localStorage.getItem("sessionid"), {
            method: update ? "PUT" : "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(semesterJson)
        }).then(r => r.json()).then(async sem => {
            let semesterID = sem.id

            for (let i = 0; i < baseMapping.length; i++) {
                let found = false
                for (let j = 0; j < userModulesMapping.length; j++) {
                    if (baseMapping[i].name === userModulesMapping[j].name) {
                        found = true
                    }
                }

                if (!found) {
                    fetch(baseURL + "/module?sessionid=" + localStorage.getItem("sessionid") + "&id=" + baseMapping[i].id, {
                        method: "DELETE"
                    })
                }
            }

            for (let i = 0; i < userModulesMapping.length; i++) {

                userModulesMapping[i].semesterid = semesterID
                setTimeout(() => {
                    fetch(baseURL + "/module?sessionid=" + localStorage.getItem("sessionid"), {
                        method: userModulesMapping[i].id === -1 ? "POST" : "PUT",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify(userModulesMapping[i])
                    })
                }, i * 200)

            }
        })

        router.back()
    }

    return (
        <>
            <Background/>
            <div className={"box-shadow input-form round-border"}>

                <p>Kursname</p>
                <input type={"text"} className={"box-shadow round-border"} style={{padding: 8, width: "100%", backgroundColor: (courseName == "") ? "#E44747" : "white"}}
                       onChange={e => onCourseNameChange(e)} value={courseName}/>

                <div style={{display: "flex", justifyContent: "flex-start", gap: 40}}>
                    <p>Theorie Anfang</p>
                    <p>Theorie Ende</p>
                </div>
                <div style={{display: "flex", justifyContent: "flex-start", gap: 20}}>
                    <input type={"date"} className={"box-shadow round-border"} style={{padding: 8, backgroundColor: (startDate == "" || startDate >= endDate) ? "#E44747" : "white"
                    }}
                           onChange={e => onStartDateChange(e)} value={startDate}/>
                    <input type={"date"} className={"box-shadow round-border"} style={{padding: 8, backgroundColor: (endDate == "" || startDate >= endDate) ? "#E44747" : "white"
                    }}
                           onChange={e => onEndDateChange(e)} value={endDate}/>
                </div>

                <p>Semester Wählen</p>
                <select className={"round-border box-shadow"} style={{padding: 5, width: "100%"}} value={semesterNumber}
                        onChange={e => onSemesterNumberChange(e)}>
                    <option value={0}>1. Semester</option>
                    <option value={1}>2. Semester</option>
                    <option value={2}>3. Semester</option>
                    <option value={3}>4. Semester</option>
                    <option value={4}>5. Semester</option>
                    <option value={5}>6. Semester</option>
                </select>

                <div className={"table-wrapper"}>
                    <table>
                        <tbody>
                        <tr>
                            <th>Wählen</th>
                            <th>Freischalten</th>
                            <th>Dozent</th>
                            <th>Modul</th>
                        </tr>
                        {
                            users.map((user, index) => (
                                <tr>
                                    <td>
                                        <input type={"checkbox"} checked={isChecked[index]}
                                               onChange={e => onCheckedChange(e, index)}/>
                                    </td>
                                    <td>
                                        <input type={"checkbox"} checked={isActivated[index]}
                                               onChange={e => onActivatedChange(e, index)}/>
                                    </td>
                                    <td>
                                        {user.firstName + " " + user.lastName}
                                    </td>
                                    <td>
                                        <select multiple={true} className={"box-shadow round-border"}
                                                style={{padding: 5}}
                                                onChange={e => onModuleSelectionChange(e, index)}>
                                            {modulesSelectorValues.map(msv => (
                                                <option value={msv}
                                                        selected={isOptionSelected(msv, user.id)}>{msv}</option>
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
                    <Button text={"Abbrechen"} onClick={onButtonAbort}/>
                    <Button text={"Speichern"} color={"#77932b"} onClick={() => { (startDate == "" || endDate == ""|| startDate >= endDate || courseName == "") ? () => {} : onButtonSave()}}/>
                </div>
            </div>
        </>
    )
}