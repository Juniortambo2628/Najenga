import { useState, useCallback } from 'react';

export default function useContextMenu() {
    const [contextMenu, setContextMenu] = useState(null);

    const openContextMenu = useCallback((e, target) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY, target });
    }, []);

    const closeContextMenu = useCallback(() => {
        setContextMenu(null);
    }, []);

    return { contextMenu, openContextMenu, closeContextMenu };
}
