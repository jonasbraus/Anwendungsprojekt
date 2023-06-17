export default function BrowserNotSupported(p)
{
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
        }} >
            <p style={{
                fontSize: 40,
                color: "red"
            }}>Sorry but your browser is not supported right now</p>
            <p style={{
                fontSize: 30
            }}>We recommend using Microsoft Edge or Google Chrome</p>
        </div>
    )
}