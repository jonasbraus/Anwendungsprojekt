import React from "react";

export default function Background()
{
    //diese komponente generiert über css properties und geschickte rotationen von div element im raum das hintergrundbild
    return (
        <div style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            overflow: "clip",
            pointerEvents: "none"
        }}>
            <div style={{
                position: "absolute",
                transform: "skew(20deg)",
                width: "100%",
                height: "100%",
                zIndex: -10,
                backgroundColor: "#f2f2f2",
                borderTopLeftRadius: 400,
                borderBottomRightRadius: 800,

            }}></div>
            <div style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                zIndex: -11,
                backgroundColor: "#346991",
            }}></div>
        </div>
    );
}