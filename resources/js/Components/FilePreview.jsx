import EmptyState from '@/Components/EmptyState';

const isPdf = (url, mime) => mime === 'application/pdf' || /\.pdf($|\?)/i.test(url);
const isImage = (url, mime) => (mime ? mime.startsWith('image/') : /\.(jpe?g|png|webp|gif|avif|heic)($|\?)/i.test(url));

/**
 * A file shown on a detail page: an image (opens full size), a PDF in a
 * frame, or, for anything else, a download. Inside a DetailPage it takes the
 * panel's height on fit screens, so the page never scrolls past it.
 *
 * @param {string} [url]      - The file; without one, `empty` shows instead
 * @param {string} [mime]     - Its type, when the URL doesn't say
 * @param {string} [name]     - For the image's alt text and the frame's title
 * @param {object} [empty]    - EmptyState props for no file
 */
export default function FilePreview({ url, mime, name = 'File', empty = { icon: 'fa-file', title: 'No file', message: 'Nothing is attached.' } }) {
    if (!url) return <EmptyState {...empty} />;

    if (isPdf(url, mime)) {
        return <iframe src={url} title={name} className="h-[70vh] w-full rounded-xl bg-white fit:h-full" />;
    }

    if (isImage(url, mime)) {
        return (
            <a href={url} target="_blank" rel="noreferrer" className="flex min-h-[300px] items-center justify-center fit:h-full" title="Open full size">
                <img src={url} alt={name} decoding="async" className="max-h-[70vh] max-w-full rounded-xl object-contain fit:max-h-full" />
            </a>
        );
    }

    return (
        <div className="flex flex-col items-center gap-3 py-16 text-center fit:h-full fit:justify-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
                <i aria-hidden="true" className="fas fa-file text-3xl text-white/40" />
            </span>
            <p className="text-sm text-gray-400">This file can't be previewed here.</p>
            <a href={url} download className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10">
                <i aria-hidden="true" className="fas fa-download mr-2" />
                Download
            </a>
        </div>
    );
}
