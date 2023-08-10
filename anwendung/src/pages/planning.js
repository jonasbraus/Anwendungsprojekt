import CalenderView from "@/components/CalenderView";
import Background from "@/components/Background";
import Logout from "@/components/Logout";
import Back from "@/components/Back";
import BasicDateCalendar from "@/components/CalendarSideBar";
import {useRouter} from "next/router";
import HelpButton from "@/components/HelpButton";


export default function planning(p)
{
    let router = useRouter()

    let semesterName;

    if (typeof window !== 'undefined'){
        semesterName = localStorage.getItem("semestername") + " " + (localStorage.getItem("admin") == 1 ? "" : localStorage.getItem("currentmodulename"))
    }


    return (
        <div className={"normal-centered"}>
            <Logout/>
            <Back onClick={() => router.back()}/>
            <HelpButton/>
            <Background/>
            <CalenderView semesterName={semesterName}/>
          </div>
    )
}