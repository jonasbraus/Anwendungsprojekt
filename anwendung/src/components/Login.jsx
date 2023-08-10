import React, {useState} from "react";
import Button from "@/components/Button";
import {NextResponse} from "next/server";
import Link from "next/link";
import {useRouter} from "next/router";
import {baseURL} from "@/components/Constants";

export default function Login() {

    let url = baseURL + "/users"

    //sollte auf den login knopf geklickt worden sein...
    async function on_login_click() {
        //füge der url die mail und das passwort an, sicherheitsfeatures werden die hier vorläufig nicht berücktsichtigt
        url += "?mail=" + inputUserName + "&password=" + inputPassword;

        let response = await fetch(url, {
            method: "GET",
        });

        //lese die antwort vom backend, und versuche die sessionid (für weitere anfragen am backend wird diese übergeben) auszulesen.
        //ist der status nicht "failed" wurden die einloggdaten gefunden und im fall, dass kein fehler aufgetreten ist
        //eine sessionid zurückgegeben.
        let reader = response.body.getReader();
        let value = String.fromCharCode.apply(null, ((await reader.read()).value))
        if (value != "failed") {
            localStorage.setItem("sessionid", value);

            url = baseURL + "/users/check?sessionid=" + value;
            fetch(url).then(r => r.json()).then(u => localStorage.setItem("userid", u.id))
            let admin = 0
            await fetch(url).then(o => o.json()).then(user => {
                admin = user.permissions})
            //setze für die spätere verwendung im localstorage, ob es sich bei dem aktuellen nutzer um einen admin handelt.
            //selbst wenn diese informationen vom nutzer im browser manuell editiert werden, blockt das backend
            //über sämtliche anfrage mit einer sessionid die dozenten bezogen ist ab. => diese information ist nur für die anzeige.
            //diese könnte allerdings nicht ordnungsgemäß funktionieren sollte ein nutzer versuchen das tool "auszutricksen"
            localStorage.setItem("admin", admin)
            //leite den nutzer je nach seinem status auf die admin oder dozenten ansicht weiter.
            if(admin === 1) {
                await router.push("/semesteroverview")
            }else await router.push("/semesteroverviewLecturer")

        } else {
            setInputPassword("");
            setInputUserName("");
            setHint("wrong login credentials")
        }
    }

    const [inputUserName, setInputUserName] = useState("")
    const [inputPassword, setInputPassword] = useState("")
    //hier states für die hinweise in den loginfeldern für späteres anzeigen von evtl. fehlgeschlagen login versuchen.
    const [hint, setHint] = useState("Benutzername")
    const [hint2, setHint2] = useState("Passwort")
    const [backgroundColor, setBackgroundColor] = useState("rgb(255, 255, 255)")
    const router = useRouter()


    return (
        // <div className="border">
            <login className={"login-container box-shadow"}>

                <p className={"font-big-fat placement"}>Login</p>
                <div className={"placement"}>
                    <p className={"font-kinda-big"}>Benutzername:</p>
                    <input type="text" value={inputUserName} onChange={e => setInputUserName(e.target.value.toLowerCase())}
                           placeholder={hint} className="input input-bordered input-sm w-full max-w-xs box-shadow"
                           style={{
                               backgroundColor: backgroundColor
                           }}/>
                    <br/>
                    <p className={"font-kinda-big"}>Passwort:</p>
                    <input type="password" value={inputPassword} onChange={e => setInputPassword(e.target.value)}
                           placeholder={hint2} className="input input-bordered input-sm w-full max-w-xs box-shadow"
                           style={{
                               backgroundColor: backgroundColor
                           }}/>
                </div>

                <Button text={"Login"} color={"#77932b"} width={100} height={40} onClick={() => on_login_click()}/>


            </login>
        // </div>
    );
}