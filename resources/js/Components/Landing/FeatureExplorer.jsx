import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Photo } from './ui';

/**
 * A list of feature groups on the left; the chosen one as a large photo card
 * on the right, with a glass summary, its key points and numbers, and (on
 * wide screens) a screen from the app.
 *
 *   groups: [{ id, eyebrow, title, summary, points: [], stats: [[value, label]], image, screen? }]
 */
export default function FeatureExplorer({ groups }) {
    const [activeId, setActiveId] = useState(groups[0].id);
    const active = groups.find((g) => g.id === activeId) ?? groups[0];

    return (
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
            <div role="tablist" aria-label="Feature areas" aria-orientation="vertical" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 lg:col-span-3 lg:mx-0 lg:block lg:space-y-1 lg:overflow-visible lg:border-l lg:border-[#D8CEC7] lg:px-0 lg:pb-0">
                {groups.map((group) => {
                    const selected = group.id === active.id;
                    return (
                        <button
                            key={group.id}
                            id={`tab-${group.id}`}
                            type="button"
                            role="tab"
                            aria-selected={selected}
                            aria-controls={`panel-${group.id}`}
                            onClick={() => setActiveId(group.id)}
                            className={`relative shrink-0 rounded-full px-4 py-2 text-left transition-colors lg:block lg:w-full lg:rounded-none lg:px-6 lg:py-3 ${selected ? 'bg-[#1A1514] text-white lg:bg-transparent lg:text-[#1A1514]' : 'bg-white/60 text-[#8A7B72] hover:text-[#1A1514] lg:bg-transparent'}`}
                        >
                            {selected && <motion.span layoutId="explorer-bar" className="absolute -left-px top-0 hidden h-full w-0.5 bg-[#B3122E] lg:block" />}
                            <span className="block whitespace-nowrap text-sm font-semibold lg:text-base lg:font-medium">{group.eyebrow}</span>
                            <span className="hidden text-xs text-[#A8998F] lg:block">{group.title}</span>
                        </button>
                    );
                })}
            </div>

            <div className="lg:col-span-9">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={active.id}
                        id={`panel-${active.id}`}
                        role="tabpanel"
                        aria-labelledby={`tab-${active.id}`}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.3 }}
                        className="relative isolate flex min-h-[34rem] flex-col justify-between overflow-hidden rounded-[2rem] p-4 sm:p-6 lg:min-h-[38rem]"
                    >
                        <Photo src={active.image} className="-z-10" />
                        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#140F0E]/90 via-[#140F0E]/15 to-[#140F0E]/15" />

                        <div className="max-w-sm rounded-3xl border border-white/50 bg-white/80 p-6 shadow-xl backdrop-blur-xl">
                            <h3 className="font-display text-2xl font-normal tracking-tight text-[#1A1514]">{active.title}</h3>
                            <p className="mt-3 text-sm leading-relaxed text-[#3A2F2C]">{active.summary}</p>
                            <ul className="mt-4 space-y-2">
                                {active.points.map((point) => (
                                    <li key={point} className="flex gap-2 text-sm text-[#3A2F2C]">
                                        <i aria-hidden="true" className="fas fa-check mt-1 text-xs text-[#B3122E]" />
                                        {point}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {active.screen && (
                            <img
                                src={active.screen}
                                alt=""
                                loading="lazy"
                                className="pointer-events-none absolute bottom-24 right-6 hidden w-[46%] rotate-[-2deg] rounded-2xl border border-white/20 shadow-2xl lg:block"
                            />
                        )}

                        <dl className="mt-10 grid grid-cols-3 gap-4 px-2 text-white sm:max-w-xl">
                            {active.stats.map(([value, label]) => (
                                <div key={label}>
                                    <dt className="text-xs text-white/70">{label}</dt>
                                    <dd className="mt-1 font-display text-xl font-light sm:text-3xl">{value}</dd>
                                </div>
                            ))}
                        </dl>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
