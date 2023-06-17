import React, {useEffect} from "react";
export default function SemesterTile(p)
{
    let editable = true;
    let color = "#ffffff"
    if (p.color != null)
    {
        color = p.color;
    }
    if (p.editable != null)
    {
        editable = p.editable
    }
    useEffect(() =>
    {
        window.addEventListener("contextmenu", (e) => (e.preventDefault()))
    })

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(0,0,0,0)"
            }}
            onClick={(e) => p.onClick(e)}>
            <p className={"semester-tile-p"} style={{
            }}>{p.text}</p>
            <p className={"semester-tile-p"} style={{
                color: "gray"
            }}>{p.text2}</p>
            <div style={{
                display: editable ? "flex" : "none",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: 5
            }}>

            </div>
        </div>
    )
}