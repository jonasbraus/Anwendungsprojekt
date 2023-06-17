import Button from "@/components/Button";
import DateElement from "@/components/DateElement";
import { arrowLeft } from "./Icons"
import { arrowRight } from "./Icons"
import { useState } from 'react'



export default function WeekSelector(p){

    return (
        <>
            <div className="weekSelector">
                <Button icon={arrowLeft} onClick={() => p.onFunctionLeft()} width={50} color={"#346991"}/>
                <DateElement year={p.year} startday={p.startday}/>
                <Button icon={arrowRight} onClick={() => p.onFunctionRight()} width={50} color={"#346991"}/>
            </div>
        </>
    )
}