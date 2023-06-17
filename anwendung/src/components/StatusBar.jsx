import React, {useState} from "react"
import {baseURL} from "@/components/Constants";
import {console} from "next/dist/compiled/@edge-runtime/primitives/console";

export default function StatusBar(p)
{
    if(p.progress > 100) p.progress = 100;
    let classNames = ["not-started", "started", "finished"];
    let index = p.progress / 50;

    let actives = ["", "", ""]
    actives[index] = "active";

    return (
        <div className={"step-container"}>
            <div className={"steps"}>
                <span className={"step " + classNames[0] + " " + actives[0]}>1</span>
                <span className={"step " + classNames[1] + " " + actives[1]}>2</span>
                <span className={"step " + classNames[2] + " " + actives[2]}>3</span>
                <div className={"progress-bar " + classNames[index]}
                     style={{
                         width: p.progress + "%"
                     }}
                ></div>
            </div>
        </div>
    )
}