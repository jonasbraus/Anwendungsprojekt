import Button from "@/components/Button";
import {useRouter} from "next/router";
import {baseURL} from "@/components/Constants";
import {arrowLeft} from "@/components/Icons";


export default function Back(p)
{
    return(
        <div style={{
            position : "absolute",
            left : 20,
            top : 20,
            width : 60,
            height : 60

        }}>
        <Button onClick={() => p.onClick()} icon={arrowLeft} color={"#77932b"} width={75} height={40}/>
        </div>
    )
}