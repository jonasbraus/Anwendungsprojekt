//hier ein test für die umrechnung zwischen internen und externen datumsformaten. Kann zur nachvollziehbarkeit der rechnung evtl. nützlich sein.
export default function Test(p)
{

    let day = 41
    let datum = new Date(2023, 0, day)
    datum.getMonth()


    let datum2 = new Date(2023, 5, 12);
    let start = new Date(datum2.getFullYear(), 0, 0);
    let dayInYear = (datum2 - start) / (1000 * 60 * 60 * 24)

}