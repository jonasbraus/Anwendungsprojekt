import Button from "@/components/Button";
import React, {useEffect, useState} from "react";
import SemesterTile from "@/components/SemesterTile";
import InputForm from "@/components/InputForm";
import {useRouter} from "next/router";
import PopUp from "@/components/PopUp";
import Background from "@/components/Background";
import Logout from "@/components/Logout";
import {baseURL} from "@/components/Constants";
import HelpButton from "@/components/HelpButton";
import StatusBar from "@/components/StatusBar";
import {deleteItem, editItem} from "@/components/Icons";

export default function SemesterOverview(p) {

    const [progresses, setProgresses] = useState([])

    async function getSemesters(set) {
        let urlTest = baseURL + "/semester/all?sessionid=" + localStorage.getItem("sessionid");

        let allSemesters
        let allModules
        let allEntries

        //Datenanfrage an das Backend für alle existierenden Semester
        await fetch(urlTest).then(response => response.json()).then(s => {
            allSemesters = s
            if (set) {
                setEntries(s)
            }
        }).then(() => {
            if(!set)
            {
                //Datenanfrage an das Backend um alle Module zu erhalten
                fetch(baseURL + "/module/all?sessionid=" + localStorage.getItem("sessionid")).then(r => r.json()).then(mod => {
                    allModules = mod
                }).then(() => {
                    //Datenanfrage an das Backend um alle gesetzten Entries zu erhalten
                    fetch(baseURL + "/entries/all?sessionid=" + localStorage.getItem("sessionid")).then(r => r.json()).then(en => {
                        allEntries = en
                    }).then(() => {
                        let modulesCountInSemester = []
                        for (let i = 0; i < allSemesters.length; i++) //durchlaufe die Anzahl der Semester welche von dem Backend zurück gegeben wurden
                        {
                            let count = 0
                            for (let j = 0; j < allModules.length; j++) { //durchlaufe die Anzahl der Module welche von dem Backend zurück gegeben wurden
                                if (allSemesters[i].id === allModules[j].semesterid) //Prüfe ob das Modul zu dem jeweiligen Semester gehört und erhöhe count
                                {
                                    count++;
                                }
                            }
                            modulesCountInSemester.push(count)
                        }

                        let temp = []
                        for (let s = 0; s < allSemesters.length; s++) //durchlaufe die Anzahl der Semester welche von dem Backend zurück gegeben wurden
                        {
                            let count = 0;

                            for (let i = 0; i < allModules.length; i++) //durchlaufe die Anzahl der Module welche von dem Backend zurück gegeben wurden
                            {
                                if (allModules[i].semesterid === allSemesters[s].id) //Prüfe ob das Modul zu dem jeweiligen Semester gehört
                                {
                                    let sum = 0
                                    let ent = allEntries.filter(e => e.moduleid === allModules[i].id) //lade alle Entries die zu dem Modul gehören in dem wir uns befinden in die Variable
                                    for (let j = 0; j < ent.length; j++) //durchlaufe die Anzahl der Entries aus ent
                                    {
                                        sum += ent[j].timeend - ent[j].timestart //summiere die Dauer aller Entries in dem Semester
                                    }

                                    sum /= 3

                                    if (sum >= 20 && allModules[i].activated === 0) //Überprüfung ob alle 20 Schulstunden eines Moduls gesetzt worden sind und der Vorlesungsplan des Moduls abgegeben worden ist
                                    {
                                        count++;
                                    }
                                }
                            }

                            if (count === 0) {
                                temp.push(0)
                            } else if (count >= 1 && count !== modulesCountInSemester[s]) {
                                temp.push(50)
                            } else {
                                temp.push(100)
                            }

                            setProgresses(temp) //setze die Fortschrittsleiste entsprechend der Einträge im Semester
                        }


                    })
                })
            }
        })

    }

    function onClickSemester(e, m) {
        if (m.target === m.currentTarget) {
            localStorage.setItem("currentsid", e.id)
            router.push("/planning") //leite weiter auf die Planungsseite
            localStorage.setItem("semestername", e.name + " Sem. " + (e.number + 1))
        }

    }

    function onClickNewSemester() {
        localStorage.setItem("currentsid", 0);
        router.push("/createSemester"); //leite weiter auf die Seite für das Inputform zur Erstellung eines neuen Semesters
    }


    function togglePopup() {
        if (modalDisplay === "block") {
            setModalDisplay("none");
        } else {
            setModalDisplay("block");
        }
    }

    function funcButtonAbort() {
        togglePopup();
    }

    async function funcButtonDelete() {
        let id = localStorage.getItem("currentsid");
        let url = baseURL + "/semester?sessionid=" + localStorage.getItem("sessionid") + "&id=" + id; //Anfrage an das Backend auf spezifisches Semesters auf das geklickt worden ist
        await fetch(url, {
            method: "DELETE" //lösche das spezifisch angeklickte Semester
        });

        togglePopup();
        getSemesters(true);
    }

    async function funcButtonEdit(e, m) {

        localStorage.setItem("currentsid", e.id);
        let semester = e;

        //setze die Einträge des Semesters auf die aktuell gespeicherten Einträge
        let startYear = semester.startyear;
        let endYear = semester.endyear;
        let startDay = semester.startday;
        let endDay = semester.endday;
        //+1 because input field shows date in another way then the date object does
        let startDate = new Date(startYear, 0, startDay + 1);
        let endDate = new Date(endYear, 0, endDay + 1);

        //speichere die abgeänderten Daten des Semesters
        await router.push({
            pathname: "/createSemester",
            query: {
                courseName: semester.name,
                startDate: startDate.toISOString().slice(0, 10),
                endDate: endDate.toISOString().slice(0, 10)
            },
        });
    }

    useEffect(() => {

        getSemesters(true);
        setTimeout(() => {
            getSemesters(false)
        }, 2000)

    }, [])


    const [entries, setEntries] = useState([])
    const [modalDisplay, setModalDisplay] = useState("none");
    const [modalHint, setModalHint] = useState("");
    const router = useRouter()

    return (
        <div className={"semester-overview"}>
            <Logout/>
            <HelpButton/>
            <Background/>
            {
                entries.map((e, index) => (
                    <div className={"semester-tile box-shadow"} onClick={(f) => onClickSemester(e, f)}>
                        <SemesterTile text={e.name + " Sem. " + (e.number + 1)} onClick={(f) => onClickSemester(e, f) /*Darstellung der Semester mit ihren Namen und der Semesternummer in welcher der Kurs sich befindet*/}
                                      onButtonDeleteClick={() => {
                                          localStorage.setItem("currentsid", e.id)
                                          setModalHint(e.name + " Löschen?");
                                          togglePopup();
                                      }} onButtonEditClick={(m) => {
                            localStorage.setItem("currentsid", e.id)
                            funcButtonEdit(e, m) /*Aufruf der Editierfunktion für das Angeklickte Semester*/;
                        }}/>
                        <StatusBar progress={progresses[index] /*Fortschrittsleiste wird gesetzt*/}/>
                        <div style={
                            {
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center"
                            }
                        }>
                            <Button icon={deleteItem} width={30} height={30} color={"#ffffff"}
                                    onClick={(m) => {
                                        localStorage.setItem("currentsid", e.id)
                                        setModalHint(e.name + " Löschen?");
                                        togglePopup()
                                    }}/>
                            <Button icon={editItem} width={30} height={30} color={"#ffffff"}
                                    onClick={(m) => {
                                        localStorage.setItem("currentsid", e.id)
                                        funcButtonEdit(e, m)
                                    }}/>
                        </div>
                    </div>))
            }
            <Button color={"#dcdcdc"} text={"+"} width={240} height={160} fontColor={"black"} fontSize={50}
                    onClick={() => onClickNewSemester() /*Zuweisung der Funktion für den Button zu Erstellung eines neuen Semesters*/}/>
            <PopUp hint={modalHint} text1={"Abbrechen"} text2={"Löschen"} displayState={modalDisplay}
                   function1={funcButtonAbort} function2={funcButtonDelete}/>
        </div>
    )
}