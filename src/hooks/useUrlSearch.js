import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";

export const useUrlSearch = (applySearch) => {
    const [searchParams] = useSearchParams();
    const urlSearch = searchParams.get("search") || "";
    const applyRef = useRef(applySearch);
    applyRef.current = applySearch;

    useEffect(() => {
        if (urlSearch) applyRef.current(urlSearch);
    }, [urlSearch]);

    return urlSearch;
};
