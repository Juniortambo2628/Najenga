import { describe, it, expect, vi } from 'vitest';
import { buttonProps, menuPoint } from '../../../resources/js/Utils/a11y';

const keyEvent = (key, target) => ({ key, target, currentTarget: target, preventDefault: vi.fn() });

describe('buttonProps', () => {
    it('makes the element a focusable button', () => {
        const props = buttonProps(() => {});
        expect(props.role).toBe('button');
        expect(props.tabIndex).toBe(0);
    });

    it('activates on Enter and Space', () => {
        const handler = vi.fn();
        const { onKeyDown } = buttonProps(handler);
        const el = {};
        onKeyDown(keyEvent('Enter', el));
        onKeyDown(keyEvent(' ', el));
        expect(handler).toHaveBeenCalledTimes(2);
    });

    it('ignores other keys and keys from nested elements', () => {
        const handler = vi.fn();
        const { onKeyDown } = buttonProps(handler);
        onKeyDown(keyEvent('a', {}));
        onKeyDown({ ...keyEvent('Enter', {}), currentTarget: {} });
        expect(handler).not.toHaveBeenCalled();
    });
});

describe('menuPoint', () => {
    it('uses pointer coordinates when present', () => {
        expect(menuPoint({ clientX: 10, clientY: 20 })).toEqual({ x: 10, y: 20 });
    });

    it('falls back to the element position for keyboard-opened menus', () => {
        const currentTarget = { getBoundingClientRect: () => ({ left: 100, top: 50 }) };
        expect(menuPoint({ clientX: 0, clientY: 0, currentTarget })).toEqual({ x: 108, y: 58 });
    });
});
