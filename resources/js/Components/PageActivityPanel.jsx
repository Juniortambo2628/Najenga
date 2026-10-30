import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import SharePanel from '@/Components/SharePanel';
import VersionList from '@/Components/VersionList';
import { PAGE_TYPES } from '@/Components/HistoryDrawer';
import { usePeopleHere } from '@/Components/OnlinePeople';
import useActiveProjectId from '@/Hooks/useActiveProjectId';
import { openHistory } from '@/Utils/historyDrawer';

/** Pages that get the activity panel when they have no side panel of their own. */
export const ACTIVITY_PANEL_PAGES = [...Object.keys(PAGE_TYPES), 'Dashboard'];

const LATEST = 5;

const button =
    'inline-flex w-full items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-gray-300 transition hover:bg-white/5 hover:text-white';

/**
 * The default side panel: who else is on this page, the latest changes to
 * its records (within the project picked in the navbar), and shortcuts to
 * the version history and the project's Share panel. Rendered only while
 * the panel is expanded, so a collapsed panel costs nothing.
 */
export default function PageActivityPanel() {
    const { component, props } = usePage();
    const type = PAGE_TYPES[component]?.type;
    const [projectId] = useActiveProjectId();
    const project = (props.auth?.projects ?? []).find((p) => String(p.id) === projectId) ?? null;
    const here = usePeopleHere();
    const [latest, setLatest] = useState({ status: 'loading', versions: [] });
    const [sharing, setSharing] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setLatest((s) => ({ ...s, status: 'loading' }));
        axios
            .get(route('history.index'), { params: { type, project_id: projectId || undefined } })
            .then(({ data }) => !cancelled && setLatest({ status: 'ready', versions: data.data.slice(0, LATEST) }))
            .catch(() => !cancelled && setLatest({ status: 'error', versions: [] }));
        return () => {
            cancelled = true;
        };
    }, [type, projectId]);

    return (
        <div className="space-y-5 text-sm">
            <section aria-labelledby="panel-here">
                <h3 id="panel-here" className="mb-2 text-[11px] font-bold capitalize text-gray-500">On this page</h3>
                {here.length === 0 ? (
                    <p className="text-gray-500">Only you right now.</p>
                ) : (
                    <ul className="space-y-1.5">
                        {here.map((person) => (
                            <li key={person.id} className="flex items-center gap-2 text-gray-300">
                                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-emerald-400" />
                                {person.name}
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section aria-labelledby="panel-latest">
                <h3 id="panel-latest" className="text-[11px] font-bold capitalize text-gray-500">Latest changes</h3>
                {latest.status === 'loading' ? (
                    <p className="py-2 text-gray-500">Loading…</p>
                ) : latest.status === 'error' ? (
                    <p className="py-2 text-gray-500">Couldn&apos;t load the latest changes.</p>
                ) : latest.versions.length === 0 ? (
                    <p className="py-2 text-gray-500">No changes yet.</p>
                ) : (
                    <VersionList versions={latest.versions} showType={!type} />
                )}
            </section>

            <div className="space-y-2">
                <button type="button" onClick={openHistory} className={button}>
                    <i aria-hidden="true" className="fas fa-clock-rotate-left w-4 text-[#DC143C]" />
                    Version history
                </button>
                {project && (
                    <button type="button" onClick={() => setSharing(true)} className={button}>
                        <i aria-hidden="true" className="fas fa-user-plus w-4 text-[#DC143C]" />
                        {project.role === 'owner' ? `Share ${project.name}` : `People in ${project.name}`}
                    </button>
                )}
            </div>
            {project && <SharePanel show={sharing} project={project} onClose={() => setSharing(false)} />}
        </div>
    );
}
