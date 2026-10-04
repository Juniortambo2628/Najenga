import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';

let pageProps = { flash: null };
const successMock = vi.fn();
const errorMock = vi.fn();
const infoMock = vi.fn();

vi.mock('@inertiajs/react', () => ({
    usePage: () => ({ props: pageProps }),
}));
// Factories are hoisted above these consts, so every reference inside must be
// deferred into a closure - only the call happens after initialisation.
vi.mock('react-hot-toast', () => ({
    default: Object.assign((...args) => infoMock(...args), {
        success: (...args) => successMock(...args),
        error: (...args) => errorMock(...args),
    }),
}));

import FlashToast from '../../../resources/js/Components/FlashToast';

function mount(flash) {
    pageProps = { flash };
    return render(<FlashToast />);
}

beforeEach(() => {
    vi.clearAllMocks();
    pageProps = { flash: null };
});

describe('FlashToast', () => {
    it('shows a success toast', () => {
        mount({ success: 'Project created successfully', error: null, status: null });
        expect(successMock).toHaveBeenCalledTimes(1);
        expect(successMock).toHaveBeenCalledWith('Project created successfully');
        expect(errorMock).not.toHaveBeenCalled();
    });

    it('shows an error toast', () => {
        mount({ success: null, error: 'Upload failed', status: null });
        expect(errorMock).toHaveBeenCalledTimes(1);
        expect(errorMock).toHaveBeenCalledWith('Upload failed');
    });

    it('gives error priority when both are present', () => {
        mount({ success: 'Saved', error: 'Also failed', status: null });
        expect(errorMock).toHaveBeenCalledTimes(1);
        expect(successMock).not.toHaveBeenCalled();
    });

    it('shows a plain toast for the auth status message', () => {
        mount({ success: null, error: null, status: 'verification-link-sent' });
        expect(infoMock).toHaveBeenCalledTimes(1);
        expect(infoMock).toHaveBeenCalledWith('verification-link-sent');
        expect(successMock).not.toHaveBeenCalled();
    });

    it('shows nothing when every flash key is empty', () => {
        mount({ success: null, error: null, status: null });
        expect(successMock).not.toHaveBeenCalled();
        expect(errorMock).not.toHaveBeenCalled();
        expect(infoMock).not.toHaveBeenCalled();
    });

    it('shows nothing when the flash prop is missing entirely', () => {
        pageProps = {};
        render(<FlashToast />);
        expect(successMock).not.toHaveBeenCalled();
        expect(infoMock).not.toHaveBeenCalled();
    });

    it('fires again for an identical message on a later visit', () => {
        const { rerender } = mount({ success: 'Saved', error: null, status: null });
        expect(successMock).toHaveBeenCalledTimes(1);

        // Inertia hands back a fresh flash object per visit, so keying the
        // effect on identity (not on the string) keeps repeat actions visible.
        pageProps = { flash: { success: 'Saved', error: null, status: null } };
        rerender(<FlashToast />);
        expect(successMock).toHaveBeenCalledTimes(2);
    });
});
