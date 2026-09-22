import { useState, useCallback } from 'react';
import { menuPoint } from '@/Utils/a11y';

export default function useContextMenu() {
    const [contextMenu, setContextMenu] = useState(null);

    const openContextMenu = useCallback((e, target) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ ...menuPoint(e), target });
    }, []);

    const closeContextMenu = useCallback(() => {
        setContextMenu(null);
    }, []);

    return { contextMenu, openContextMenu, closeContextMenu };
}
