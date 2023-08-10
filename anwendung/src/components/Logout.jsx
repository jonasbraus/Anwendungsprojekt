import Button from "@/components/Button";
import {useRouter} from "next/router";
import {baseURL} from "@/components/Constants";

export default function Logout()
{
    const router = useRouter()

    async function logout()
    {
        let url = baseURL + "/users/logout?sessionid=" + localStorage.getItem("sessionid");
        await fetch(url)
        await router.push("/")
    }

    return (
        <div style={{
            position: "absolute",
            right: 20,
            top: 20,
            width: 130,
            height: 60,
            borderBottomRightRadius: 10,

        }}>
            <Button onClick={() => logout()} text={"Logout"} color={"#77932b"} width={100} height={40}/>
        </div>
    )
}