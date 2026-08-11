import TextInput from '@/Components/TextInput';
import TextArea from '@/Components/TextArea';
import SelectInput from '@/Components/SelectInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';

function renderField(field, data, setData, errors) {
    const value = data[field.name] ?? '';
    const onChange = (e) => {
        setData(field.name, e.target.value);
    };
    const error = errors[field.name];

    const inputClass = `mt-1 block w-full ${field.className || ''}`.trim();

    switch (field.type) {
        case 'textarea':
            return (
                <div key={field.name}>
                    <InputLabel value={field.label} />
                    <TextArea
                        value={value}
                        onChange={onChange}
                        rows={field.rows || 3}
                        className={inputClass}
                        placeholder={field.placeholder}
                        disabled={field.disabled}
                    />
                    <InputError message={error} className="mt-2" />
                </div>
            );

        case 'select':
            return (
                <div key={field.name}>
                    <InputLabel value={field.label} />
                    <SelectInput
                        value={value}
                        onChange={onChange}
                        placeholder={field.placeholder || `Select ${field.label?.toLowerCase() || ''}`}
                        disabled={field.disabled}
                    >
                        {(field.options || []).map((opt) => {
                            const val = field.optionValue ? field.optionValue(opt) : opt.value;
                            const lbl = field.optionLabel ? field.optionLabel(opt) : opt.label;
                            return <option key={val} value={val}>{lbl}</option>;
                        })}
                    </SelectInput>
                    <InputError message={error} className="mt-2" />
                </div>
            );

        default:
            return (
                <div key={field.name}>
                    <InputLabel value={field.label} />
                    <div className={field.suffix ? 'flex gap-2 mt-1' : ''}>
                        <TextInput
                            type={field.type}
                            value={value}
                            onChange={onChange}
                            className={field.suffix ? 'flex-1' : inputClass}
                            placeholder={field.placeholder}
                            step={field.step}
                            min={field.min}
                            max={field.max}
                            disabled={field.disabled}
                        />
                        {field.suffix && (
                            <span className="inline-flex items-center px-3 rounded-xl border border-white/10 bg-white/5 text-gray-400 text-sm">{field.suffix}</span>
                        )}
                    </div>
                    {field.hint && <p className="text-xs text-gray-500 mt-1">{field.hint}</p>}
                    <InputError message={error} className="mt-2" />
                </div>
            );
    }
}

export default function ResourceFormFields({ schema, data, setData, errors }) {
    return schema.map((item) => {
        if (item._isGroup) {
            const fieldCount = item.fields.length;
            const gridClass = fieldCount === 2 ? 'md:grid-cols-2' : fieldCount === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2';
            return (
                <div key={item.label} className={`grid grid-cols-1 ${gridClass} gap-6`}>
                    {item.fields.map((f) => renderField(f, data, setData, errors))}
                </div>
            );
        }
        return renderField(item, data, setData, errors);
    });
}
