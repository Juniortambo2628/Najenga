/**
 * The container for a page's main list or table.
 *
 * Inside a DashboardPage with `fill`, the panel takes the rest of the screen:
 * only its body scrolls (give table headers `sticky top-0`), while the
 * optional header and footer stay visible. Elsewhere it is a normal panel.
 *
 * @param {ReactNode} [header]        - Pinned above the scrolling body
 * @param {ReactNode} [footer]        - Pinned below the scrolling body
 * @param {boolean}   [plain]         - No panel chrome (for grids of cards)
 * @param {string}    [className]     - Extra classes for the panel
 * @param {string}    [bodyClassName] - Extra classes for the scrolling body
 */
export default function ListPanel({ children, header, footer, plain = false, className = '', bodyClassName = '' }) {
    const chrome = plain ? '' : 'panel overflow-hidden';
    return (
        <div className={`flex flex-col fit:flex-1 fit:min-h-0 ${chrome} ${className}`}>
            {header && <div className="shrink-0">{header}</div>}
            <div
                data-scroll-region
                className={`overflow-x-auto overscroll-contain fit:flex-1 fit:min-h-0 fit:overflow-y-auto ${plain ? 'fit:-m-1 fit:p-1' : ''} ${bodyClassName}`}
            >
                {children}
            </div>
            {footer && <div className={`shrink-0 ${plain ? 'pt-3' : 'border-t border-white/[0.08]'}`}>{footer}</div>}
        </div>
    );
}
