import { describe, it, expect } from 'vitest';
import { folderOf, isImage, makeBatches } from '../../../resources/js/Utils/photoUpload';

const item = (size, name = 'x.jpg') => ({ file: { size, name }, path: name });

describe('folderOf', () => {
    it('returns the folder part of a relative path', () => {
        expect(folderOf('2025/October/Busia-Photos-Oct-7/x.jpg')).toBe('2025/October/Busia-Photos-Oct-7');
        expect(folderOf('x.jpg')).toBe('');
    });
});

describe('isImage', () => {
    it('accepts images by type or extension and rejects others', () => {
        expect(isImage({ type: 'image/jpeg', name: 'a' })).toBe(true);
        expect(isImage({ type: '', name: 'PHOTO-2026-07-30-14-15-40.jpg.jpeg' })).toBe(true);
        expect(isImage({ type: 'video/mp4', name: 'clip.mp4' })).toBe(false);
        expect(isImage({ type: '', name: 'desktop.ini' })).toBe(false);
    });
});

describe('makeBatches', () => {
    it('caps the number of files per request', () => {
        const batches = makeBatches(Array.from({ length: 25 }, () => item(1)), { maxFiles: 10, maxBytes: 0 });
        expect(batches.map((b) => b.length)).toEqual([10, 10, 5]);
    });

    it('keeps each request under 90% of post_max_size', () => {
        const batches = makeBatches([item(40), item(40), item(40)], { maxFiles: 10, maxBytes: 100 });
        expect(batches.map((b) => b.length)).toEqual([2, 1]);
    });

    it('still sends a single file that is bigger than the budget on its own', () => {
        const batches = makeBatches([item(500), item(1)], { maxFiles: 10, maxBytes: 100 });
        expect(batches.map((b) => b.length)).toEqual([1, 1]);
    });
});
