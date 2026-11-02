/**
 * Najenga's dashboard keeps its Font Awesome icons (served from
 * /vendor/fontawesome, loaded by the dashboard only). `fa('fa-receipt')` is a
 * component the kit can render wherever it takes an icon; `faNav()` is the
 * same in the sidebar's box (an inline span around a w-5 icon, as Najenga's
 * sidebar had).
 */
const cache = new Map();

function make(key, render) {
  if (!cache.has(key)) {
    const Icon = render;
    Icon.displayName = `Fa(${key})`;
    cache.set(key, Icon);
  }
  return cache.get(key);
}

const classOf = (name, brand) => `${brand ? 'fab' : 'fas'} ${name}`;

export function fa(name, { brand = false } = {}) {
  const cls = classOf(name, brand);
  return make(cls, ({ className = '', ...rest }) => <i aria-hidden="true" className={`${cls} ${className}`} {...rest} />);
}

export function faNav(name, { brand = false } = {}) {
  const cls = classOf(name, brand);
  return make(`nav ${cls}`, () => (
    <span className="relative">
      <i aria-hidden="true" className={`${cls} w-5 text-center`} />
    </span>
  ));
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
