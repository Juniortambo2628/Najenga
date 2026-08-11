class FieldBuilder {
    constructor(name) {
        this._name = name;
        this._type = 'text';
        this._label = '';
        this._placeholder = '';
        this._required = false;
        this._disabled = false;
        this._rows = 3;
        this._step = null;
        this._options = null;
        this._optionLabel = null;
        this._optionValue = null;
        this._grid = null;
        this._className = '';
        this._hint = null;
        this._min = null;
        this._max = null;
        this._suffix = null;
    }

    text() { this._type = 'text'; return this; }
    number() { this._type = 'number'; return this; }
    email() { this._type = 'email'; return this; }
    password() { this._type = 'password'; return this; }
    date() { this._type = 'date'; return this; }
    textarea() { this._type = 'textarea'; return this; }

    select() { this._type = 'select'; return this; }
    options(opts) {
        if (Array.isArray(opts) && opts.length > 0 && typeof opts[0] === 'object' && 'value' in opts[0]) {
            this._options = opts;
        } else if (Array.isArray(opts)) {
            this._options = opts.map(o => typeof o === 'string' ? { value: o, label: o } : o);
        }
        return this;
    }
    optionLabel(fn) { this._optionLabel = fn; return this; }
    optionValue(fn) { this._optionValue = fn; return this; }

    label(l) { this._label = l; return this; }
    placeholder(p) { this._placeholder = p; return this; }
    required(r = true) { this._required = r; return this; }
    disabled(d = true) { this._disabled = d; return this; }
    rows(r) { this._rows = r; return this; }
    step(s) { this._step = s; return this; }
    min(v) { this._min = v; return this; }
    max(v) { this._max = v; return this; }
    className(c) { this._className = c; return this; }
    hint(h) { this._hint = h; return this; }
    suffix(s) { this._suffix = s; return this; }

    toSchema() {
        return {
            name: this._name,
            type: this._type,
            label: this._label,
            placeholder: this._placeholder,
            required: this._required,
            disabled: this._disabled,
            rows: this._rows,
            step: this._step,
            min: this._min,
            max: this._max,
            options: this._options,
            optionLabel: this._optionLabel,
            optionValue: this._optionValue,
            className: this._className,
            hint: this._hint,
            suffix: this._suffix,
        };
    }
}

export function field(name) {
    return new FieldBuilder(name);
}

export function group(label, ...fields) {
    return {
        _isGroup: true,
        label,
        fields: fields.map(f => f instanceof FieldBuilder ? f.toSchema() : f),
    };
}

export function computeDefaults(fields) {
    const defaults = {};
    for (const item of fields) {
        if (item._isGroup) {
            Object.assign(defaults, computeDefaults(item.fields));
        } else {
            const f = item instanceof FieldBuilder ? item.toSchema() : item;
            defaults[f.name] = f.defaultValue ?? '';
        }
    }
    return defaults;
}
