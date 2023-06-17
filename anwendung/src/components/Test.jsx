export default function Test(p)
{

    // let datum = new Date(2023, 1, 10);
    // let start = new Date(datum.getFullYear(), 0, 0);
    //
    // let difference = (datum - start) / (1000 * 60 * 60 * 24)


    let day = 41
    let datum = new Date(2023, 0, 30)

    return (

        <div>
            <p>{datum.getMonth()}</p>
        </div>
    );
}