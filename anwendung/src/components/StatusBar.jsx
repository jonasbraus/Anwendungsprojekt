import React, {useState} from "react"
import {baseURL} from "@/components/Constants";
import {console} from "next/dist/compiled/@edge-runtime/primitives/console";

export default function StatusBar(p)
{
    if(p.progress > 100) p.progress = 100;
    let classNames = ["not-started"];
    let index = p.progress / 50;
    let index2 = p.progress / 100;
    let index3 = p.progress - 100;
    let index4 = p.progress - 50;

    let actives = ["", "", ""];
    actives[index] = "active";

    let actives2 = ["", "", ""];
    actives2[index2] = "active";

    let actives3 = ["", "", ""];
    actives3[index3] = "active";

    let actives4 = ["", "", ""];
    actives4[index4] = "active";

    return (
        <div className={"step-container"}>
            <div className={"steps"}>
                <span className={"step " + classNames[0] + " " + actives[0] + actives2[1] + actives3[1] + actives4[0]}>1</span>
                <span className={"step " + classNames[0] + " " + actives[1] + actives2[1] + actives3[1] + actives4[1]}>2</span>
                <span className={"step " + classNames[0] + " " + actives[2] + actives2[2] + actives3[2] + actives4[2]}>3</span>
                <div className={"progress-bar " + classNames[index]}
                     style={{
                         width: p.progress + "%"
                     }}
                ></div>
            </div>
        </div>
    )
}