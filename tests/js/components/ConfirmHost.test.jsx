import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import ConfirmHost from '../../../resources/js/Components/ConfirmHost';
import { confirmAction, confirmOptions, promptAction } from '../../../resources/js/Utils/feedback';

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

describe('confirmOptions', () => {
    it('uses a short message as the title and its verb as the button', () => {
        const opts = confirmOptions('Delete 3 expenses?');
        expect(opts.title).toBe('Delete 3 expenses?');
        expect(opts.message).toBeNull();
        expect(opts.confirmLabel).toBe('Delete');
        expect(opts.tone).toBe('danger');
    });

    it('keeps a long message as the body under a generic title', () => {
        const opts = confirmOptions(`Remove this member from the project? ${'x'.repeat(60)}`);
        expect(opts.title).toBe('Are you sure?');
        expect(opts.message).toMatch(/^Remove this member/);
        expect(opts.confirmLabel).toBe('Remove');
    });

    it('is not dangerous for neutral questions', () => {
        expect(confirmOptions('Send the invite again?').tone).toBe('default');
    });
});

describe('confirmAction', () => {
    it('falls back to the browser dialog without a host', async () => {
        const spy = vi.spyOn(window, 'confirm').mockReturnValue(true);
        await expect(confirmAction('Delete it?')).resolves.toBe(true);
        expect(spy).toHaveBeenCalledWith('Delete it?');
    });

    it('resolves true when confirmed in the styled dialog', async () => {
        render(<ConfirmHost />);
        let result;
        await act(async () => {
            result = confirmAction('Delete this expense?');
        });
        expect(screen.getByText('Delete this expense?')).toBeInTheDocument();
        await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Delete' })));
        await expect(result).resolves.toBe(true);
        expect(screen.queryByText('Delete this expense?')).toBeNull();
    });

    it('resolves false when cancelled', async () => {
        render(<ConfirmHost />);
        let result;
        await act(async () => {
            result = confirmAction('Remove this receipt?');
        });
        await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Cancel' })));
        await expect(result).resolves.toBe(false);
    });
});

describe('promptAction', () => {
    it('resolves the trimmed text, or null when cancelled', async () => {
        render(<ConfirmHost />);
        let result;
        await act(async () => {
            result = promptAction({ title: 'Rename folder', label: 'Name', defaultValue: 'Old' });
        });
        fireEvent.change(screen.getByLabelText('Name'), { target: { value: '  Permits  ' } });
        await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Save' })));
        await expect(result).resolves.toBe('Permits');

        await act(async () => {
            result = promptAction({ title: 'Rename folder', label: 'Name' });
        });
        expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
        await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Cancel' })));
        await expect(result).resolves.toBeNull();
    });
});
