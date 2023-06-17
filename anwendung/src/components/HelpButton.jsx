import Button from "@/components/Button";
import {helpButton} from "@/components/Icons";
import {useRouter} from "next/router";

export default function HelpButton(p)
{
    const router = useRouter()

    return (
        <div style={{
            position: "absolute",
            bottom: 20,
            right: 20,
            borderRadius: 15
        }} className={"box-shadow"}>
            <Button width={40} height={40} color={"white"} icon={helpButton} onClick={() => router.push("/help")}/>
        </div>
    )
}