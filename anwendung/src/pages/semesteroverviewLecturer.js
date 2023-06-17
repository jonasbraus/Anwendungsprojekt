import React, {useEffect, useState} from "react";
import SemesterTile from "@/components/SemesterTile";
import {useRouter} from "next/router";
import Background from "@/components/Background";
import Logout from "@/components/Logout";
import {baseURL} from "@/components/Constants"
import HelpButton from "@/components/HelpButton";
import StatusBar from "@/components/StatusBar";

export default function SemesteroverviewLecturer(p) {

    const [timeStamps, setTimeStamps] = useState([])

    function getModules() {
        let urlTest = baseURL + "/module/id?sessionid=" + localStorage.getItem("sessionid");

        fetch(urlTest).then(response => response.json()).then(m => {
            setEntries(m);
            let args = "";
            for (let i = 0; i < m.length; i++) {
                args += m[i].semesterid;

                if (i < m.length - 1) {
                    args += "a";
                }
            }

            let temp = []
            let semesterURL = baseURL + "/semester/id/all?ids=" + args + "&sessionid=" + localStorage.getItem("sessionid");
            fetch(semesterURL).then(r => r.json()).then(sem => {
                sem.map(e => {
                    temp.push(e.name + " Sem. " + (e.number + 1))
                })
            }).then(() => setSemesterNames(temp)).then(() => {
                let entriesURL = baseURL + "/entries/all?sessionid=" + localStorage.getItem("sessionid")
                fetch(entriesURL).then(r => r.json()).then(en => {
                    let tempTimeStamps = []
                    for(let j = 0; j < m.length; j++)
                    {
                        let sum = 0
                        let currentModule = m[j]
                        for (let i = 0; i < en.length; i++)
                        {
                            if(currentModule.id === en[i].moduleid)
                            {
                                sum += en[i].timeend - en[i].timestart
                            }
                        }

                        sum /= 3
                        tempTimeStamps.push(sum)
                    }

                    setTimeStamps(tempTimeStamps)

                })
            })
        })

    }

    function onClickSemester(e, m, name) {
        if (e.activated == 1) {
            if (m.target === m.currentTarget) {
                localStorage.setItem("currentsid", e.semesterid)
                localStorage.setItem("currentmodulename", e.name)
                localStorage.setItem("moduleid", e.id)
                localStorage.setItem("semestername", name)
                router.push("/planning")
            }
        }
    }


    useEffect(() => {
        setTimeout(() => {
            getModules();
        }, 1000)
    }, [])

    const [entries, setEntries] = useState([]);
    const [semesterNames, setSemesterNames] = useState([]);
    const router = useRouter();

    function getProgressForTime(time, activated)
    {
        console.log(activated)

        if(time === 0)
        {
            return 0
        }
        else if( 20 >= time > 0 && activated === 1)
        {
            return 50
        }
        else if(time >= 20 && activated === 0)
        {
            return 100
        }
    }

    return (
        <div className={"semester-overview"}>
            <Logout/>
            <Background/>
            <HelpButton/>
            {entries.map((e, index) => (
                <div className={"semester-tile box-shadow"} style={{
                    backgroundColor: e.activated == 1 ? "#ffffff" : "#aaaaaa"
                }} onClick={(f) => onClickSemester(e, f, semesterNames[index])}>
                    <SemesterTile
                        editable={false} text={semesterNames[index]} text2={e.name}
                        onClick={(f) => onClickSemester(e, f, semesterNames[index])}
                    />
                    <StatusBar progress={getProgressForTime(timeStamps[index], e.activated)} module={e}/>
                </div>
            ))}
        </div>
    );
}