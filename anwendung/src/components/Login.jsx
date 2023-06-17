import React, {useState} from "react";
import Button from "@/components/Button";
import {NextResponse} from "next/server";
import Link from "next/link";
import {useRouter} from "next/router";
import {baseURL} from "@/components/Constants";

export default function Login() {

    let url = baseURL + "/users"

    async function on_login_click() {
        url += "?mail=" + inputUserName + "&password=" + inputPassword;

        let response = await fetch(url, {
            method: "GET",
        });

        let reader = response.body.getReader();
        let value = String.fromCharCode.apply(null, ((await reader.read()).value))
        if (value != "failed") {
            localStorage.setItem("sessionid", value);

            url = baseURL + "/users/check?sessionid=" + value;
            fetch(url).then(r => r.json()).then(u => localStorage.setItem("userid", u.id))
            let admin = 0
            await fetch(url).then(o => o.json()).then(user => {
                admin = user.permissions})
            localStorage.setItem("admin", admin)
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
    const [hint, setHint] = useState("type here")
    const [backgroundColor, setBackgroundColor] = useState("rgb(255, 255, 255)")
    const router = useRouter()


    return (
        // <div className="border">
            <login className={"login-container box-shadow"}>
                <p className={"font-big-fat placement"}>Login</p>
                <div className={"placement"}>
                    <br/>
                    <p className={"font-kinda-big"}>Username</p>
                    <input type="text" value={inputUserName} onChange={e => setInputUserName(e.target.value.toLowerCase())}
                           placeholder={hint} className="input input-bordered input-sm w-full max-w-xs box-shadow"
                           style={{
                               backgroundColor: backgroundColor
                           }}/>
                    <br/>
                    <p className={"font-kinda-big"}>Password</p>
                    <input type="password" value={inputPassword} onChange={e => setInputPassword(e.target.value)}
                           placeholder={hint} className="input input-bordered input-sm w-full max-w-xs box-shadow"
                           style={{
                               backgroundColor: backgroundColor
                           }}/>
                </div>

                <Button text={"Login"} color={"#77932b"} width={100} height={40} onClick={() => on_login_click()}/>


            </login>
        // </div>
    );
}