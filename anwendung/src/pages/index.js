import {Inter} from 'next/font/google'
import React, {useEffect, useState} from "react";
import Login from "@/components/Login";
import Background from "@/components/Background";
import {useRouter} from "next/router";
import HelpButton from "@/components/HelpButton";


const inter = Inter({subsets: ['latin']})

export default function Home(p) {
    const router = useRouter()

    //hier wird im login fenster überpüft ob der aktuelle browser mit dem tool kompatibel ist.
    //evtl. sind auch browser, die nicht chrome basiert sind kompatibel, diese konnten aber nicht ausführlich genug getest werden.
    useEffect(() => {
        let isEdge = window.navigator.userAgent.indexOf("Edg") > -1
        let isChrome = window.navigator.userAgent.indexOf("Chrome") > -1
        let isFireFox = window.navigator.userAgent.indexOf("firefox") > -1

        //ist der browser nicht unterstützt so wird der nutzer auf die browser nicht unterstützt seite weitergeleitet.
        if(!(isEdge || isChrome || isFireFox))
        {
            router.push("/browserNotSupported")
        }
    })

    return (


        <div className={"normal-centered"}>
            <Background/>
            <h1 style={{
                fontSize: 40,
                fontWeight: "bold",
                color: "#77932b",
                marginBottom: "5%",
                textShadow: "2px 2px 2px rgba(0, 0, 0, 0.2)",
                textAlign: "center"
            }}>Willkommen in deinem Vorlesungsplaner</h1>
            <Login/>
            <p1 style={{
                fontSize: 18,
                fontWeight: "bold",
                color: "red",
                marginTop: "5%",
                textAlign: "center",
                maxWidth: 450,
                justifyContent: "start"
            }}>Es handelt sich hierbei um eine BETA-VERSION! Keine Gewähr auf Korrekte oder vollständige Informationen</p1>
        </div>
    )
}