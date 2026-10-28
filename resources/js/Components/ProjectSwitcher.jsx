import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Menu, MenuButton, MenuItem, MenuItems, MenuSeparator } from '@headlessui/react';
import SharePanel, { RoleBadge } from '@/Components/SharePanel';
import useActiveProjectId from '@/Hooks/useActiveProjectId';

const itemClass = 'flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-gray-300 data-[focus]:bg-white/5 data-[focus]:text-white';

/**
 * The navbar's project switcher: which project every page shows ("All
 * projects" or one), your role in each, and shortcuts for the picked project
 * (its page, and sharing it). Pages read the choice with useActiveProjectId().
 */
export default function ProjectSwitcher() {
    const projects = usePage().props.auth?.projects ?? [];
    const [activeId, setActiveId] = useActiveProjectId();
    const [sharing, setSharing] = useState(false);

    if (projects.length === 0) return null;

    const active = projects.find((p) => String(p.id) === activeId) ?? null;

    return (
        <>
            <Menu as="div" data-tour="project-switcher" className="relative min-w-0">
                <MenuButton
                    aria-label={`Project: ${active ? active.name : 'All projects'}. Change project`}
                    className="flex min-w-0 max-w-[8.5rem] items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-sm text-gray-200 transition hover:border-white/20 hover:text-white sm:max-w-[16rem]"
                >
                    <i aria-hidden="true" className="fas fa-diagram-project text-xs text-[#DC143C]" />
                    <span className="truncate">{active ? active.name : 'All projects'}</span>
                    <i aria-hidden="true" className="fas fa-chevron-down text-[10px] text-gray-500" />
                </MenuButton>
                <MenuItems
                    anchor="bottom start"
                    className="z-50 mt-1 w-72 overflow-hidden rounded-xl border border-white/[0.08] bg-surface-overlay py-1 shadow-2xl focus:outline-none"
                >
                    <MenuItem>
                        <button type="button" onClick={() => setActiveId(null)} className={itemClass}>
                            <i aria-hidden="true" className="fas fa-layer-group w-4 text-gray-500" />
                            <span className="flex-1">All projects</span>
                            {!active && <i aria-label="Selected" className="fas fa-check text-xs text-[#DC143C]" />}
                        </button>
                    </MenuItem>
                    <div className="max-h-72 overflow-y-auto">
                        {projects.map((project) => {
                            const selected = String(project.id) === activeId;
                            return (
                                <MenuItem key={project.id}>
                                    <button type="button" onClick={() => setActiveId(project.id)} className={itemClass}>
                                        <i aria-hidden="true" className="fas fa-diagram-project w-4 text-gray-500" />
                                        <span className="min-w-0 flex-1 truncate">{project.name}</span>
                                        <RoleBadge role={project.role} />
                                        {selected && <i aria-label="Selected" className="fas fa-check text-xs text-[#DC143C]" />}
                                    </button>
                                </MenuItem>
                            );
                        })}
                    </div>
                    {active && (
                        <>
                            <MenuSeparator className="my-1 h-px bg-white/10" />
                            <MenuItem>
                                <Link href={route('projects.show', active.id)} className={itemClass}>
                                    <i aria-hidden="true" className="fas fa-arrow-up-right-from-square w-4 text-gray-500" />
                                    Open {active.name}
                                </Link>
                            </MenuItem>
                            <MenuItem>
                                <button type="button" onClick={() => setSharing(true)} className={itemClass}>
                                    <i aria-hidden="true" className="fas fa-user-plus w-4 text-gray-500" />
                                    {['owner', 'manager'].includes(active.role) ? 'Share…' : 'Members…'}
                                </button>
                            </MenuItem>
                        </>
                    )}
                </MenuItems>
            </Menu>
            {active && <SharePanel show={sharing} project={active} onClose={() => setSharing(false)} />}
        </>
    );
}
