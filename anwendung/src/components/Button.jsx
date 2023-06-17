/**
 * Function Takes in Paramter for:
 * text: text to be shown on the button
 * width, height: width and height of the button
 * icon: an icon that should be shown on the button (HTML <svg> tag) (see Icons.js for example)
 * iconWidth, iconHeight: width and height of the icon
 * onClick: a function that should be run if the button is clicked
 * Example for onClick:
 * <Button onClick={onClick={() => {console.log("do something")}}
 * Example for icon:
 */
export default function Button(p) {

    //default parameters for the button
    let text = p.text;
    let width = p.width, height = p.height;
    let iconHTML = p.icon;
    let iconWidth = p.iconWidth, iconHeight = p.iconHeight;
    let onClick = p.onClick;
    let color = p.color;
    let fontColor = p.fontColor;
    let font_size = p.fontSize;

    //if parameters are not set, they are set to default values
    if (height == null) height = 0;
    if (width == null) width = 0;
    if (iconWidth == null) iconWidth = width-10;
    if (iconHeight == null) iconHeight = height-10;
    if (onClick == null) onClick = () => {};
    if (color == null) color = "#363636";
    if (fontColor == null) fontColor = "white";
    if (font_size == null) font_size = 16;

    //build in the icon width and height to the svg tag (svg tag should not contain any size information by default)
    if (iconHTML != null) {
        let split = iconHTML.split("fill=");
        split[1] = "fill=" + split[1];
        split[0] += " width=" + iconWidth + " height=" + iconHeight + " ";
        iconHTML = split[0] + split[1]
    } else {
        iconHTML = "";
    }

    //return the button
    return (
        <>
            <button className={"round-border button font font-small"}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: color,
                        color: fontColor,
                        fontSize: font_size,
                        minWidth: width,
                        minHeight: height,
                        textAlign: "center",
                    }}
                    onClick={onClick}>
                {text}
                <div dangerouslySetInnerHTML={{__html: iconHTML}}/>
            </button>
        </>
    );
}
