function addDays(date, days) {
    let result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

export default function DateElement(p){

    let startDate = new Date(p.year, 0, p.startday);
    let endDate = new Date(p.year, 0, p.startday + 5);

    let startDateString = `${startDate.getDate()}.${startDate.getMonth()+1}.${startDate.getFullYear()}`; //Anfang der Woche in der man sich befindet wird in startDateString geladen
    let endDateString = `${endDate.getDate()}.${endDate.getMonth()+1}.${endDate.getFullYear()}`; //Ende der Woche in der man sich befindet wird in endDateString geladen
    return /*Anzeige des Beginns und Endes der Woche in der man sich befindet*/(
        <>
            <div className="dateElement round-border box-shadow">
                <p>{startDateString} - {endDateString}</p>
            </div>
        </>
    );
}
