// Helpers for the bulk photo uploader (Pages/Photos/Create.jsx).

const IMAGE_EXT = /\.(jpe?g|png|webp|gif)$/i;

export const isImage = (file) => file.type?.startsWith('image/') || IMAGE_EXT.test(file.name);

// "2025/October/Busia-Photos-Oct-7/x.jpg" -> "2025/October/Busia-Photos-Oct-7"
export const folderOf = (path) => {
    const i = path.lastIndexOf('/');
    return i === -1 ? '' : path.slice(0, i);
};

/**
 * Turn a drop into [{ file, path }], walking into dropped folders.
 * Must be called synchronously from the drop handler: the browser clears
 * dataTransfer.items once the handler returns.
 */
export function readDroppedEntries(dataTransfer) {
    const entries = Array.from(dataTransfer.items || [])
        .map((item) => item.webkitGetAsEntry?.())
        .filter(Boolean);

    if (entries.length === 0) {
        return Promise.resolve(Array.from(dataTransfer.files || []).map((file) => ({ file, path: file.name })));
    }

    return Promise.all(entries.map(walkEntry)).then((lists) => lists.flat());
}

function walkEntry(entry) {
    if (entry.isFile) {
        return new Promise((resolve) =>
            entry.file(
                (file) => resolve([{ file, path: entry.fullPath.replace(/^\//, '') }]),
                () => resolve([]),
            ),
        );
    }

    // readEntries returns at most ~100 children per call, so read until empty.
    const reader = entry.createReader();
    const children = [];
    const readAll = () =>
        new Promise((resolve) => {
            reader.readEntries(
                (batch) => {
                    if (batch.length === 0) return resolve();
                    children.push(...batch);
                    readAll().then(resolve);
                },
                () => resolve(),
            );
        });

    return readAll().then(() => Promise.all(children.map(walkEntry))).then((lists) => lists.flat());
}

/**
 * Split items into upload requests that stay under PHP's limits:
 * max_file_uploads (maxFiles) and post_max_size (maxBytes, with headroom
 * for the form fields).
 */
export function makeBatches(items, { maxFiles, maxBytes }) {
    const byteBudget = maxBytes > 0 ? maxBytes * 0.9 : Infinity;
    const batches = [];
    let current = [];
    let bytes = 0;

    for (const item of items) {
        const size = item.file.size;
        if (current.length && (current.length >= maxFiles || bytes + size > byteBudget)) {
            batches.push(current);
            current = [];
            bytes = 0;
        }
        current.push(item);
        bytes += size;
    }

    if (current.length) batches.push(current);
    return batches;
}

export const SOURCE_LABELS = {
    exif: { label: 'Camera data', guess: false },
    filename: { label: 'Filename', guess: false },
    folder: { label: 'Folder (day)', guess: false },
    folder_month: { label: 'Folder (month only)', guess: true },
    file_modified: { label: 'File time', guess: true },
    manual: { label: 'Set by you', guess: false },
    upload: { label: 'No date found', guess: true },
};
