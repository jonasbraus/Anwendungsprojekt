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

        await fetch(urlTest).then(response => response.json()).then(s => {
            allSemesters = s
            if (set) {
                setEntries(s)
            }
        }).then(() => {
            if(!set)
            {
                fetch(baseURL + "/module/all?sessionid=" + localStorage.getItem("sessionid")).then(r => r.json()).then(mod => {
                    allModules = mod
                }).then(() => {
                    fetch(baseURL + "/entries/all?sessionid=" + localStorage.getItem("sessionid")).then(r => r.json()).then(en => {
                        allEntries = en
                    }).then(() => {
                        let modulesCountInSemester = []
                        for (let i = 0; i < allSemesters.length; i++) {
                            let count = 0
                            for (let j = 0; j < allModules.length; j++) {
                                if (allSemesters[i].id === allModules[j].semesterid) {
                                    count++;
                                }
                            }
                            modulesCountInSemester.push(count)
                        }

                        let temp = []
                        for (let s = 0; s < allSemesters.length; s++) {
                            let count = 0;

                            for (let i = 0; i < allModules.length; i++) {
                                if (allModules[i].semesterid === allSemesters[s].id) {
                                    let sum = 0
                                    let ent = allEntries.filter(e => e.moduleid === allModules[i].id)
                                    for (let j = 0; j < ent.length; j++) {
                                        sum += ent[j].timeend - ent[j].timestart
                                    }

                                    sum /= 3

                                    if (sum >= 20 && allModules[i].activated === 0) {
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

                            setProgresses(temp)
                        }


                    })
                })
            }
        })

    }

    function onClickSemester(e, m) {
        if (m.target === m.currentTarget) {
            localStorage.setItem("currentsid", e.id)
            router.push("/planning")
            localStorage.setItem("semestername", e.name + " Sem. " + (e.number + 1))
        }

    }

    function onClickNewSemester() {
        localStorage.setItem("currentsid", 0);
        router.push("/createSemester");
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
        let url = baseURL + "/semester?sessionid=" + localStorage.getItem("sessionid") + "&id=" + id;
        await fetch(url, {
            method: "DELETE"
        });

        togglePopup();
        getSemesters(true);
    }

    async function funcButtonEdit(e, m) {

        localStorage.setItem("currentsid", e.id);
        let semester = e;

        let startYear = semester.startyear;
        let endYear = semester.endyear;
        let startDay = semester.startday;
        let endDay = semester.endday;
        //+1 because input field shows date in another way then the date object does
        let startDate = new Date(startYear, 0, startDay + 1);
        let endDate = new Date(endYear, 0, endDay + 1);

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

    }, [])
    useEffect(() => {
        setTimeout(() => {
            getSemesters(false)
        }, 1000)
    })


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
                        <SemesterTile text={e.name + " Sem. " + (e.number + 1)} onClick={(f) => onClickSemester(e, f)}
                                      onButtonDeleteClick={() => {
                                          localStorage.setItem("currentsid", e.id)
                                          setModalHint(e.name + " Löschen?");
                                          togglePopup();
                                      }} onButtonEditClick={(m) => {
                            localStorage.setItem("currentsid", e.id)
                            funcButtonEdit(e, m);
                        }}/>
                        <StatusBar progress={progresses[index]}/>
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
                    onClick={() => onClickNewSemester()}/>
            <PopUp hint={modalHint} text1={"Abbrechen"} text2={"Löschen"} displayState={modalDisplay}
                   function1={funcButtonAbort} function2={funcButtonDelete}/>
        </div>
    )
}