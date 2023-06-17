import {Inter} from 'next/font/google'
import React, {useEffect, useState} from "react";
import Login from "@/components/Login";
import Background from "@/components/Background";
import {useRouter} from "next/router";
import HelpButton from "@/components/HelpButton";


const inter = Inter({subsets: ['latin']})

export default function Home(p) {
    const router = useRouter()

    useEffect(() => {
        let isEdge = window.navigator.userAgent.indexOf("Edg") > -1
        let isChrome = window.navigator.userAgent.indexOf("Chrome") > -1

        if(!(isEdge || isChrome))
        {
            router.push("/browserNotSupported")
        }
    })

    return (


        <div className={"normal-centered"}>
            <Background/>
            <HelpButton/>
            <h1 style={{
                fontSize: 40,
                fontWeight: "bold",
                color: "#77932b",
                marginBottom: "5%",
                textShadow: "2px 2px 2px rgba(0, 0, 0, 0.2)",
                textAlign: "center"
            }}>Willkommen in deinem Vorlesungsplaner</h1>
            <Login/>
        </div>
    )
}