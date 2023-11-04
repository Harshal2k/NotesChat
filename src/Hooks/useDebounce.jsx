import { useEffect, useState } from "react";


const useDebounce = (value, dealy = 500) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const id = setTimeout(() => {
            setDebouncedValue(value);
        }, dealy);

        return () => {
            clearTimeout(id);
        }
    }, [value, dealy]);

    return debouncedValue;
}

export default useDebounce;