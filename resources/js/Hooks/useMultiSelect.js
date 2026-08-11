import { useCallback, useMemo, useState } from 'react';

export default function useMultiSelect() {
    const [selected, setSelected] = useState(new Set());

    const toggle = useCallback((id, multiSelect = false) => {
        setSelected((prev) => {
            const next = new Set(multiSelect ? prev : []);
            if (prev.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const selectAll = useCallback((ids) => {
        setSelected(new Set(ids));
    }, []);

    const deselectAll = useCallback(() => {
        setSelected(new Set());
    }, []);

    const clear = useCallback(() => {
        setSelected(new Set());
    }, []);

    const isSelected = useCallback((id) => selected.has(id), [selected]);

    const count = useMemo(() => selected.size, [selected]);

    return { selected, toggle, selectAll, deselectAll, clear, isSelected, count };
}
