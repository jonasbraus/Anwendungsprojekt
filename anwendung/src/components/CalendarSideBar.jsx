import {useEffect, useRef} from "react";

let startParts = []
let endParts = []
const months = [["Januar", 31], ["Februar", 28], ["März", 31], ["April", 30], ["Mai", 31], ["Juni", 30], ["Juli", 31], ["August", 31], ["September", 30], ["Oktober", 31], ["November", 30], ["Dezember", 31]]
const days = months.map((month => month[1]))
let result = []
let startDate
let calculatedDay = []
const weekdays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]
let lastMonth = 0

export default function BasicDateCalendar(p) {

    const ref = useRef(null)

    function getBackMonthColor(monthIndex)
    {
        let date = new Date(parseInt(startParts[2]), parseInt(startParts[1])  + monthIndex - 1, 1)
        if (date.getFullYear() === p.highlightYear && date.getMonth() === p.highlightMonth)
        {
            if(lastMonth !== p.highlightMonth)
            {
                ref.current.scrollTo({top: 290 * monthIndex - 270, behavior: "smooth"})
            }
            lastMonth = p.highlightMonth
            return true
        }else
            return false
    }

    useEffect(() => {
        startParts = []
        endParts = []
        result = []
        calculatedDay = []

        startDate = new Date(p.startyear,  0 ,p.startday)
        let endDate = new Date(p.endyear, 0 , p.endday)
        let startString = startDate.getDate() + "." + (startDate.getMonth() + 1) +  "." + p.startyear
        let endString = endDate.getDate() + "." + (endDate.getMonth() + 1) +  "." + p.endyear
        generateCalendar(startString, endString)
    })

    return (
        <div className={"Allround"} ref={ref}>
            <div className={"Down"}>
                {result.map((monthResult, index) => (
                    <div className={"A box-shadow"} onClick={() => p.onMonthClick(
                        (parseInt(startParts[1]) + index),
                        startParts
                    )} >
                        <p style={{
                            textAlign : "center",
                            marginBottom : 10,
                            fontSize: 19,
                            pointerEvents: "none",
                            backgroundColor: getBackMonthColor(index) ? "#346991":"rgba(0,0,0,0)",
                            color : getBackMonthColor(index) ? "white":"black",
                            borderRadius : 10
                        }}>{getMonthName(index) + " " + new Date(parseInt(startParts[2]), parseInt(startParts[1])  + index - 1, 1).getFullYear()}</p>
                        <div className={"Days"} style={{
                            pointerEvents: "none"
                        }}>
                            {weekdays.map((weekday) => (
                                <p key={weekday} style={{
                                    pointerEvents: "none"
                                }}>{weekday}</p>
                            ))}
                            {freeSpaces(index)}
                            {monthResult.map((date) => (
                                <p key={date} style={{
                                    pointerEvents: "none"
                                }}>{date}</p>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}



function getMonthName(monthIndex) {
    if (startParts[1] - 1 + monthIndex < 12) {
        return months[startParts[1] - 1 + monthIndex][0];
    } else {
        return months[startParts[1] - 1 + monthIndex - 12][0];
    }
}

function generateCalendar(start, ende)
{
    splitter(start, ende)
    if (startParts[2] < endParts[2])
    {
        for (let i = startParts[1] - 1; i <= 11; i++)
        {
            let monthResult = [];
            for (let j = 1; j <= days[i]; j++)
            {
                if (
                    new Date(startParts[2], i, j) >= new Date(startParts[2], startParts[1] - 1, startParts[0]) &&
                    new Date(startParts[2], i, j) <= new Date(startParts[2], 11, 31)
                )
                {
                    monthResult.push(j);
                    calculateDay(startParts[2], i, j)
                }
            }
            result.push(monthResult);
            if (i == 11)
            {
                for (let h = 0; h <= endParts[1] - 1; h++)
                {
                    let monthResultNewYear = [];
                    for (let g = 1; g <= days[h]; g++)
                    {
                        if (new Date(endParts[2], h, g) <= new Date(endParts[2], endParts[1] - 1, endParts[0]))
                        {
                            monthResultNewYear.push(g);
                            calculateDay(endParts[2], h, g)
                        }
                    }
                    result.push(monthResultNewYear);
                }
            }
        }
    } else
    {
        for (let i = startParts[1] - 1; i <= endParts[1] - 1; i++)
        {
            let monthResult = [];
            for (let j = 1; j <= days[i]; j++)
            {
                if (
                    new Date(startParts[2], i, j) >= new Date(startParts[2], startParts[1] - 1, startParts[0]) &&
                    new Date(startParts[2], i, j) <= new Date(startParts[2], endParts[1] - 1, endParts[0])
                )
                {
                    monthResult.push(j)
                    calculateDay(startParts[2], i, j)
                }
            }
            result.push(monthResult);
        }
    }
}

function calculateDay(x, i, j){
    if (j == startDate.getDate() && i == startDate.getMonth() || j == 1){
        let monthStart = new Date(x, i, j)
        if (monthStart.getDay() == 0)
            calculatedDay.push(6)
        else calculatedDay.push(monthStart.getDay() - 1)
    }
}

function freeSpaces(index)
{
    let arrayTest = []
    for (let i = 0; i < calculatedDay[index]; i++) {
        arrayTest.push(<p style={{
            pointerEvents: "none"
        }}></p>)
    }
    return arrayTest
}

function splitter(startDate, endDate)
{
    startParts = startDate.split(".")
    if (startParts[1][0] === 0) //prüft ob die erste Stelle des Monats eine 0 vorne stehen hat
    {
        startParts[1] = startParts[1][1] //überschreibt den Monat ohne die 0
    }
    endParts = endDate.split(".") //prüft ob die erste Stelle des Monats eine 0 vorne stehen hat
    if (endParts[1][0] === 0)
    {
        endParts[1] = endParts[1][1] //überschreibt den Monat ohne die 0
    }
}