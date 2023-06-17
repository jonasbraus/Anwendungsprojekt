import Button from "@/components/Button";
import {useState} from "react";

let shown = false;

export default function PopUp(p) {


    return (
        <>
            <div style={{
                display: p.displayState,
                zIndex: 1000
            }}>

                <div className={"modal-container"}>
                    <div className={"modal box-shadow"}>
                        <p className={"font-middle"}>{p.hint}</p>
                        <div>
                            <Button text={p.text1} color={"rgba(54,54,54,0.64)"} onClick={p.function1}/>
                            <Button text={p.text2} color={"#77932b"} onClick={p.function2}/>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}