import React from 'react';

const Tile = () => {
    const [isHovered, setIsHovered] = React.useState(false);
    const [cursorPosition, setCursorPosition] = React.useState({ x: 0, y: 0 });
    const tileRef = React.useRef(null);

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    const handleMouseMove = (event) => {
        if (tileRef.current) {
            const rect = tileRef.current.getBoundingClientRect();
            setCursorPosition({
                x: event.clientX - rect.left,
                y: event.clientY - rect.top,
            });
        }
    };

    return (
        <div
            ref={tileRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
            style={{
                backgroundColor: 'rgba(255,0,0,0.89)',
                width: '250px',
                height: '150px',
                margin: '10px',
                transition: 'transform 0.2s',
                transform: isHovered ? 'translateY(-5px)' : 'none',
                position: 'relative',
                borderRadius: '10px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <span style = {{ color: 'white', fontWeight: 'bold'}}>Kalender</span>


            {isHovered && (
                <div
                    style={{
                        position: 'absolute',
                        top: cursorPosition.y - 10,
                        left: cursorPosition.x - 10,
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background:
                            'radial-gradient(circle at center, rgba(255, 255, 255) 0%, rgba(255,255,255,0) 70%)',
                    }}
                />
            )}
        </div>
    );
};

export default Tile;
