/**
 * Najenga's dashboard keeps its Font Awesome icons (served from
 * /vendor/fontawesome, loaded by the dashboard only). `fa('fa-receipt')` is a
 * component the kit can render wherever it takes an icon.
 */
const cache = new Map();

export function fa(name, { brand = false } = {}) {
  const key = `${brand ? 'fab' : 'fas'} ${name}`;
  if (!cache.has(key)) {
    // Najenga's icon box (w-5, centred), whatever size the kit asks for.
    // In the sidebar, the same box as Najenga's own: an inline span around a w-5 icon.
    const Icon = ({ className = '' }) => (className.includes('w-')
      ? <span className="relative"><i aria-hidden="true" className={`${key} w-5 text-center`} /></span>
      : <i aria-hidden="true" className={`${key} ${className}`} />);
    Icon.displayName = `Fa(${name})`;
    cache.set(key, Icon);
  }
  return cache.get(key);
}

export function loadFontAwesome() {
  if (document.getElementById('fontawesome')) return;
  // Into Tailwind's base layer: unlayered, its `.fas { display; line-height }`
  // would beat every Tailwind 4 utility (`hidden`, `text-lg`) on an icon.
  const style = document.createElement('style');
  style.id = 'fontawesome';
  style.textContent = "@import url('/vendor/fontawesome/css/all.min.css') layer(base);";
  document.head.prepend(style);
}
