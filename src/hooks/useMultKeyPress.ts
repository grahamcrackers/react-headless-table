import React from 'react';

export function useMultiKeyPress() {
    // State for keeping track of whether key is pressed
    const [keysPressed, setKeyPressed] = React.useState<Set<string>>(new Set([]));

    // If pressed keys are our target keys then set to true
    const downHandler = ({ key }: KeyboardEvent) => {
        setKeyPressed(keysPressed.add(key));
    };

    // If key(s) are released our target Set is cleared
    const upHandler = ({ key }: KeyboardEvent) => {
        keysPressed.delete(key);
        setKeyPressed(keysPressed);
    };

    // Add event listeners
    React.useEffect(() => {
        window.addEventListener('keydown', downHandler);
        window.addEventListener('keyup', upHandler);
        // Remove event listeners on cleanup
        return () => {
            window.removeEventListener('keydown', downHandler);
            window.removeEventListener('keyup', upHandler);
        };
    }, []); // Empty array ensures that effect is only run on mount and unmount

    return keysPressed;
}
