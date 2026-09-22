// Small helpers for making mouse-first widgets keyboard operable.

const isActivationKey = (e) => e.key === 'Enter' || e.key === ' ';

// onKeyDown handler that runs `handler` on Enter or Space, like a native button.
export function onActivate(handler) {
    return (e) => {
        if (e.target !== e.currentTarget || !isActivationKey(e)) return;
        e.preventDefault();
        handler(e);
    };
}

// Props for a div that acts as a button (e.g. a clickable card or drop zone).
export function buttonProps(handler) {
    return {
        role: 'button',
        tabIndex: 0,
        onKeyDown: onActivate(handler),
    };
}

// Where to anchor a context menu. Keyboard-opened context menus (menu key,
// Shift+F10) can report 0,0, so fall back to the element's own position.
export function menuPoint(e) {
    if (e.clientX || e.clientY) return { x: e.clientX, y: e.clientY };
    const rect = e.currentTarget?.getBoundingClientRect?.();
    return rect ? { x: rect.left + 8, y: rect.top + 8 } : { x: 0, y: 0 };
}
