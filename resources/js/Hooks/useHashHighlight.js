import { useEffect, useState } from 'react';

export default function useHashHighlight(prefix) {
    const [highlighted, setHighlighted] = useState(null);

    useEffect(() => {
        const hash = decodeURIComponent(window.location.hash.replace(/^#/, ''));
        if (!hash.startsWith(prefix)) return;

        const id = hash.slice(prefix.length);
        if (!id) return;

        setHighlighted(id);

        const timer = setTimeout(() => {
            document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 200);

        return () => clearTimeout(timer);
    }, [prefix]);

    return highlighted;
}
