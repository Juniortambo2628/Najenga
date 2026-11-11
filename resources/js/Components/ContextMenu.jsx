import { useEffect, useState } from 'react';
import { ContextMenu as KitContextMenu } from '@okjt/ui';

const icons = new Map();

/** A Font Awesome icon (`fa-pen`) as the kind of icon component the kit's menu draws, one per name. */
function faIcon(name) {
    if (!icons.has(name)) {
        icons.set(name, function FaIcon({ className = '' }) {
            return <i aria-hidden="true" className={`fas ${name} text-center ${className}`} />;
        });
    }
    return icons.get(name);
}

/**
 * The kit's context menu, taking Najenga's row options:
 *   [{ label, icon: 'fa-pen', action, danger? }]
 * at `position` ({ x, y }, from useContextMenu). When it closes, focus goes
 * back to whatever opened it (the kit's menu doesn't do that yet).
 */
export default function ContextMenu({ options, position, onClose }) {
    // Read while rendering: the kit's menu focuses its first item before effects here run.
    const [opener] = useState(() => document.activeElement);
    useEffect(() => {
        return () => {
            if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
        };
    }, [opener]);

    const items = options.map((option) => ({
        label: option.label,
        danger: option.danger,
        icon: option.icon ? faIcon(option.icon) : undefined,
        onClick: option.action,
    }));

    return <KitContextMenu items={items} position={position} onClose={onClose} />;
}
