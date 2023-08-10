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

    function getBackMonthColor(monthIndex) //Farbliche Kennzeichnung des Monats in dem man aktuell Plant
    {
        let date = new Date(parseInt(startParts[2]), parseInt(startParts[1])  + monthIndex - 1, 1) //Datums Objekt des Monats in dem man sich aktuell befindet
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

        startDate = new Date(p.startyear,  0 ,p.startday) //Startdatum des Theoriesemesters
        let endDate = new Date(p.endyear, 0 , p.endday) //Enddatum des Theoriesemesters
        let startString = startDate.getDate() + "." + (startDate.getMonth() + 1) +  "." + p.startyear
        let endString = endDate.getDate() + "." + (endDate.getMonth() + 1) +  "." + p.endyear
        generateCalendar(startString, endString)
    })

    return (
        <div className={"Allround"} ref={ref}>
            <div className={"Down"}>
                {result.map((monthResult, index) => ( //map durch alle Monate aus dem Array monthResult
                    <div className={"A box-shadow"} onClick={() => p.onMonthClick(
                        (parseInt(startParts[1]) + index),
                        startParts //gibt zurück auf welchen Monat geklickt wurde, wodurch direkt in den jeweiligen Monat gewechselt werden kann
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
                                <p key={weekday} style={{ //generiere einmal alle Wochentage (Montag,...,Sonntag)
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


function getMonthName(monthIndex) { //holt die relevanten Monatsnamen aus dem 2D Array
    if (startParts[1] - 1 + monthIndex < 12) {
        return months[startParts[1] - 1 + monthIndex][0];
    } else {
        return months[startParts[1] - 1 + monthIndex - 12][0];
    }
}

function generateCalendar(start, ende)
{
    splitter(start, ende)
    if (startParts[2] < endParts[2]) //Abfrage für den Fall, dass ein Theoriesemester Jahresübergreifend ist
    {
        for (let i = startParts[1] - 1; i <= 11; i++) //Durchlaufe alle Monate bis zum Jahresende
        {
            let monthResult = [];
            for (let j = 1; j <= days[i]; j++) //durchlaufe alle Tage des Monats in dem wir uns befinden
            {
                if (
                    new Date(startParts[2], i, j) >= new Date(startParts[2], startParts[1] - 1, startParts[0]) &&
                    new Date(startParts[2], i, j) <= new Date(startParts[2], 11, 31)
                ) //überprüft ob der Tag noch in der angegebenen Zeitspanne des Theoriesemsters liegt
                {
                    monthResult.push(j);
                    calculateDay(startParts[2], i, j)
                }
            }
            result.push(monthResult);
            if (i == 11) //erstes Jahr ist fertig abgebildet
            {
                for (let h = 0; h <= endParts[1] - 1; h++) //laufe vom Anfang des Jahres bis zum angegebenen Ende des Theoriesemesters
                {
                    let monthResultNewYear = [];
                    for (let g = 1; g <= days[h]; g++) //durchlaufe alle Tage des Monats in dem wir uns befinden
                    {
                        if (new Date(endParts[2], h, g) <= new Date(endParts[2], endParts[1] - 1, endParts[0])) //überprüft ob der Tag noch in der angegebenen Zeitspanne des Theoriesemsters liegt
                        {
                            monthResultNewYear.push(g);
                            calculateDay(endParts[2], h, g)
                        }
                    }
                    result.push(monthResultNewYear);
                }
            }
        }
    } else //Normalfall das ein Anfang und Ende eines Theoriesemester im gleichen Jahr liegt
    {
        for (let i = startParts[1] - 1; i <= endParts[1] - 1; i++) //durchlaufe alle Monate in der angegebenen Zeitspanne
        {
            let monthResult = [];
            for (let j = 1; j <= days[i]; j++) //durchlaufe alle Tage des Monats in dem wir uns befinden
            {
                if (
                    new Date(startParts[2], i, j) >= new Date(startParts[2], startParts[1] - 1, startParts[0]) &&
                    new Date(startParts[2], i, j) <= new Date(startParts[2], endParts[1] - 1, endParts[0])
                ) //überprüft ob der Tag noch in der angegebenen Zeitspanne des Theoriesemsters liegt
                {
                    monthResult.push(j)
                    calculateDay(startParts[2], i, j)
                }
            }
            result.push(monthResult);
        }
    }
}

function calculateDay(x, i, j)//berechnet den Wochentag eines Datums (Montag,...,Sonntag)
{
    if (j == startDate.getDate() && i == startDate.getMonth() || j == 1){
        let monthStart = new Date(x, i, j)
        if (monthStart.getDay() == 0)
            calculatedDay.push(6)
        else calculatedDay.push(monthStart.getDay() - 1)
    }
}

function freeSpaces(index)//generiert Leerzeichen damit Tage genau unter ihrem jeweiligen Wochentag stehen
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