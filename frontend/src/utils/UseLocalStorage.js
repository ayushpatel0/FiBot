import { useState, useEffect } from "react";

const UseLocalStorage = (key, initialValue) => {
    const [value, setValue] = useState(() => {
        const storedValue = localStorage.getItem(key);
        return storedValue ?
            JSON.parse(storedValue) :
            initialValue;
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [key,value]);

    useEffect(() => {
        const handleStorageChange = () => {
            const newValue = localStorage.getItem(key);
            setValue(newValue ? JSON.parse(newValue) : initialValue);
        };

        window.addEventListener("storage", handleStorageChange);
        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, [key, initialValue]);

    return [value, setValue];
};

export default UseLocalStorage;