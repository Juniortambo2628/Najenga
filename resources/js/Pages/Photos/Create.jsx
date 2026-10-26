import ResourceFormPage from '@/Components/ResourceFormPage';
import SelectInput from '@/Components/SelectInput';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import CancelButton from '@/Components/CancelButton';
import { router } from '@inertiajs/react';
import { useMemo, useRef, useState } from 'react';
import { SOURCE_LABELS, folderOf, isImage, makeBatches, readDroppedEntries } from '@/Utils/photoUpload';

const RESOLVE_CHUNK = 1000;
const FILES_SHOWN_PER_FOLDER = 200;

// Mirrors App\Services\PhotoDateResolver::SOURCE_MANUAL; a folder date the user typed.
const effectiveDate = (item, overrides) => {
    const override = overrides[folderOf(item.path)];
    if (override) return { taken_at: `${override} 00:00:00`, source: 'manual' };
    return item.resolved ?? { taken_at: null, source: 'upload' };
};

const formatDate = (value) => (value ? value.slice(0, 16).replace(' ', ' at ') : '—');

export default function Create({ projects = [], uploadLimits = { maxFiles: 10, maxBytes: 0, maxFileBytes: 20 * 1024 * 1024 } }) {
    const [items, setItems] = useState([]);
    const [tooLarge, setTooLarge] = useState([]);
    const [overrides, setOverrides] = useState({});
    const [expanded, setExpanded] = useState({});
    const [projectId, setProjectId] = useState(projects.length === 1 ? String(projects[0].id) : '');
    const [phase, setPhase] = useState('select'); // select | resolving | review | uploading | done
    const [progress, setProgress] = useState({ sent: 0, uploaded: 0, skipped: 0, failed: 0 });
    const [errors, setErrors] = useState([]);
    const [dragging, setDragging] = useState(false);
    const folderInputRef = useRef(null);
    const fileInputRef = useRef(null);

    const addEntries = async (entries) => {
        const seen = new Set(items.map((i) => `${i.path}|${i.file.size}`));
        const images = entries.filter(({ file }) => isImage(file));
        const fresh = images.filter(({ file, path }) => !seen.has(`${path}|${file.size}`) && seen.add(`${path}|${file.size}`));
        const ok = fresh.filter(({ file }) => file.size <= uploadLimits.maxFileBytes);
        setTooLarge((prev) => [...prev, ...fresh.filter(({ file }) => file.size > uploadLimits.maxFileBytes).map(({ path }) => path)]);

        if (ok.length === 0) return;

        setPhase('resolving');
        const resolved = [];
        try {
            for (let i = 0; i < ok.length; i += RESOLVE_CHUNK) {
                const chunk = ok.slice(i, i + RESOLVE_CHUNK);
                const { data } = await window.axios.post(route('photos.resolveDates'), {
                    files: chunk.map(({ file, path }) => ({ name: file.name, path, last_modified: file.lastModified || null })),
                });
                resolved.push(...data.dates);
            }
        } catch {
            setErrors((prev) => [...prev, 'Could not read dates for the selected files; they will be dated on upload.']);
        }

        setItems((prev) =>
            [...prev, ...ok.map((entry, i) => ({ ...entry, resolved: resolved[i] ?? null }))].sort((a, b) =>
                a.path.localeCompare(b.path),
            ),
        );
        setPhase('review');
    };

    const onPick = (e) => {
        const entries = Array.from(e.target.files).map((file) => ({ file, path: file.webkitRelativePath || file.name }));
        e.target.value = '';
        addEntries(entries);
    };

    const onDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        if (phase === 'uploading') return;
        readDroppedEntries(e.dataTransfer).then(addEntries);
    };

    const folders = useMemo(() => {
        const groups = new Map();
        for (const item of items) {
            const key = folderOf(item.path);
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(item);
        }

        return Array.from(groups, ([path, files]) => {
            const dated = files.map((f) => effectiveDate(f, overrides));
            const times = dated.map((d) => d.taken_at).filter(Boolean).sort();
            const sources = {};
            dated.forEach((d) => (sources[d.source] = (sources[d.source] || 0) + 1));
            const guesses = dated.filter((d) => SOURCE_LABELS[d.source]?.guess).length;
            return { path, files, dated, sources, guesses, first: times[0], last: times[times.length - 1] };
        });
    }, [items, overrides]);

    const totalGuesses = folders.reduce((n, f) => n + f.guesses, 0);

    const upload = async () => {
        setPhase('uploading');
        setErrors([]);
        const tally = { sent: 0, uploaded: 0, skipped: 0, failed: 0 };
        setProgress({ ...tally });

        for (const batch of makeBatches(items, uploadLimits)) {
            const form = new FormData();
            form.append('project_id', projectId);
            batch.forEach((item, i) => {
                form.append(`photos[${i}]`, item.file, item.file.name);
                form.append(`relative_paths[${i}]`, item.path);
                if (item.file.lastModified) form.append(`last_modified[${i}]`, String(item.file.lastModified));
                const override = overrides[folderOf(item.path)];
                if (override) form.append(`taken_at[${i}]`, override);
            });

            try {
                const { data } = await window.axios.post(route('photos.store'), form, {
                    headers: { Accept: 'application/json' },
                });
                const skipped = data.skipped?.length ?? 0;
                tally.skipped += skipped;
                tally.uploaded += batch.length - skipped;
            } catch (err) {
                tally.failed += batch.length;
                const reason = err.response?.data?.message || err.message;
                setErrors((prev) => [...prev, `${batch[0].path}${batch.length > 1 ? ` (+${batch.length - 1} more)` : ''}: ${reason}`]);
            }

            tally.sent += batch.length;
            setProgress({ ...tally });
        }

        setPhase('done');
    };

    const reset = () => {
        setItems([]);
        setTooLarge([]);
        setOverrides({});
        setExpanded({});
        setErrors([]);
        setPhase('select');
    };

    const busy = phase === 'resolving' || phase === 'uploading';
    const percent = items.length ? Math.round((progress.sent / items.length) * 100) : 0;

    return (
        <ResourceFormPage
            title="Upload Photos"
            breadcrumbs={[{ label: 'Photos', href: route('photos') }, { label: 'Upload' }]}
        >
            <div className="space-y-6">
                {phase !== 'done' && (
                    <div
                        onDragOver={(e) => {
                            e.preventDefault();
                            setDragging(true);
                        }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={onDrop}
                        className={`border-2 border-dashed rounded-xl p-8 text-center transition ${
                            dragging ? 'border-[#8B0000] bg-[#8B0000]/10' : 'border-white/20'
                        }`}
                    >
                        <i aria-hidden="true" className="fas fa-folder-open text-4xl text-gray-400 mb-3"></i>
                        <p className="text-gray-300">Drop photo folders or images here</p>
                        <p className="text-gray-400 text-sm mt-1">
                            Dates are read from the photo, its filename (e.g. “WhatsApp Image 2025-10-07 at 20.21.35”) or
                            its folders (e.g. 2025 / October / Oct-7).
                        </p>
                        <div className="mt-4 flex flex-wrap justify-center gap-3">
                            <SecondaryButton type="button" disabled={busy} onClick={() => folderInputRef.current?.click()}>
                                <i aria-hidden="true" className="fas fa-folder mr-2"></i>Choose folder
                            </SecondaryButton>
                            <SecondaryButton type="button" disabled={busy} onClick={() => fileInputRef.current?.click()}>
                                <i aria-hidden="true" className="fas fa-images mr-2"></i>Choose files
                            </SecondaryButton>
                        </div>
                        <input
                            ref={folderInputRef}
                            type="file"
                            webkitdirectory=""
                            directory=""
                            multiple
                            onChange={onPick}
                            className="hidden"
                            aria-label="Choose a folder of photos"
                        />
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={onPick}
                            className="hidden"
                            aria-label="Choose photo files"
                        />
                    </div>
                )}

                {phase === 'resolving' && (
                    <p className="text-gray-400 text-sm" role="status">
                        <i aria-hidden="true" className="fas fa-spinner fa-spin mr-2"></i>Reading dates…
                    </p>
                )}

                {tooLarge.length > 0 && (
                    <p className="text-amber-400 text-sm">
                        {tooLarge.length} file(s) are larger than {Math.round(uploadLimits.maxFileBytes / 1024 / 1024)} MB
                        and will not be uploaded.
                    </p>
                )}

                {items.length > 0 && phase !== 'done' && (
                    <div>
                        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                            <h3 className="text-white font-semibold">
                                {items.length} photo{items.length !== 1 ? 's' : ''} in {folders.length} folder
                                {folders.length !== 1 ? 's' : ''}
                            </h3>
                            {totalGuesses > 0 && (
                                <span className="text-amber-400 text-sm">
                                    <i aria-hidden="true" className="fas fa-exclamation-triangle mr-1"></i>
                                    {totalGuesses} with an approximate date: set a folder date to fix them
                                </span>
                            )}
                        </div>

                        <div className="divide-y divide-white/10 border border-white/10 rounded-xl">
                            {folders.map((folder) => (
                                <div key={folder.path} className="p-3">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <button
                                            type="button"
                                            className="text-left flex-1 min-w-0"
                                            onClick={() => setExpanded((e) => ({ ...e, [folder.path]: !e[folder.path] }))}
                                            aria-expanded={!!expanded[folder.path]}
                                        >
                                            <i
                                                aria-hidden="true"
                                                className={`fas fa-chevron-${expanded[folder.path] ? 'down' : 'right'} text-gray-500 mr-2 text-xs`}
                                            ></i>
                                            <span className="text-white break-all">{folder.path || '(no folder)'}</span>
                                            <span className="text-gray-400 text-sm ml-2">
                                                {folder.files.length} · {folder.first ? folder.first.slice(0, 10) : 'no date'}
                                                {folder.last && folder.last.slice(0, 10) !== folder.first?.slice(0, 10)
                                                    ? ` → ${folder.last.slice(0, 10)}`
                                                    : ''}
                                            </span>
                                            {folder.guesses > 0 && (
                                                <span className="ml-2 text-xs text-amber-400">{folder.guesses} approximate</span>
                                            )}
                                        </button>
                                        <label className="flex items-center gap-2 text-sm text-gray-400">
                                            Folder date
                                            <input
                                                type="date"
                                                value={overrides[folder.path] || ''}
                                                disabled={busy}
                                                onChange={(e) =>
                                                    setOverrides((o) => ({ ...o, [folder.path]: e.target.value }))
                                                }
                                                className="bg-white/5 border border-white/20 rounded-lg px-2 py-1 text-white"
                                                aria-label={`Date for all photos in ${folder.path || 'this selection'}`}
                                            />
                                        </label>
                                    </div>

                                    {expanded[folder.path] && (
                                        <ul className="mt-2 ml-6 space-y-1 text-sm">
                                            {folder.files.slice(0, FILES_SHOWN_PER_FOLDER).map((item, i) => {
                                                const d = folder.dated[i];
                                                const label = SOURCE_LABELS[d.source] ?? { label: d.source, guess: true };
                                                return (
                                                    <li key={item.path} className="flex flex-wrap justify-between gap-2">
                                                        <span className="text-gray-300 break-all">{item.file.name}</span>
                                                        <span className={label.guess ? 'text-amber-400' : 'text-gray-400'}>
                                                            {formatDate(d.taken_at)} · {label.label}
                                                        </span>
                                                    </li>
                                                );
                                            })}
                                            {folder.files.length > FILES_SHOWN_PER_FOLDER && (
                                                <li className="text-gray-500">
                                                    …and {folder.files.length - FILES_SHOWN_PER_FOLDER} more
                                                </li>
                                            )}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {(phase === 'uploading' || phase === 'done') && (
                    <div role="status" aria-live="polite">
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-[#8B0000] transition-all" style={{ width: `${percent}%` }} />
                        </div>
                        <p className="text-gray-300 text-sm mt-2">
                            {progress.sent} of {items.length} processed · {progress.uploaded} uploaded ·{' '}
                            {progress.skipped} duplicate{progress.skipped !== 1 ? 's' : ''} skipped
                            {progress.failed > 0 && <span className="text-red-400"> · {progress.failed} failed</span>}
                        </p>
                    </div>
                )}

                {errors.length > 0 && (
                    <ul className="text-red-400 text-sm space-y-1">
                        {errors.map((err, i) => (
                            <li key={i}>{err}</li>
                        ))}
                    </ul>
                )}

                {phase === 'done' ? (
                    <div className="flex justify-end gap-3 pt-4">
                        <SecondaryButton type="button" onClick={reset}>
                            Upload more
                        </SecondaryButton>
                        <PrimaryButton type="button" onClick={() => router.visit(route('photos'))}>
                            View gallery
                        </PrimaryButton>
                    </div>
                ) : (
                    <>
                        <div>
                            <InputLabel htmlFor="photo-upload-project-id" value="Project" />
                            <SelectInput
                                id="photo-upload-project-id"
                                value={projectId}
                                disabled={busy}
                                onChange={(e) => setProjectId(e.target.value)}
                                required
                            >
                                <option value="">Select a project</option>
                                {projects.map((project) => (
                                    <option key={project.id} value={project.id}>
                                        {project.name}
                                    </option>
                                ))}
                            </SelectInput>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            {items.length > 0 && !busy && (
                                <SecondaryButton type="button" onClick={reset}>
                                    Clear
                                </SecondaryButton>
                            )}
                            <CancelButton href={route('photos')}>Cancel</CancelButton>
                            <PrimaryButton type="button" onClick={upload} disabled={busy || !projectId || items.length === 0}>
                                {phase === 'uploading' ? `Uploading… ${percent}%` : `Upload ${items.length || ''} photo${items.length === 1 ? '' : 's'}`}
                            </PrimaryButton>
                        </div>
                    </>
                )}
            </div>
        </ResourceFormPage>
    );
}
