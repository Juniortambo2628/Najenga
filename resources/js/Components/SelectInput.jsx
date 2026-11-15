import { forwardRef } from 'react';
import { AdminSelect } from '@okjt/dashboard';
import { FIELD_CLASSES } from './fieldClasses';

/** A select: the OKJT kit's AdminSelect in Najenga's look, with an optional placeholder option. */
export default forwardRef(function SelectInput(
    { options = [], placeholder, className = '', children, ...props },
    ref,
) {
    return (
        <AdminSelect bare {...props} ref={ref} baseClassName={FIELD_CLASSES.select} className={className}>
            {placeholder && (
                <option value="" className="bg-surface-overlay text-gray-400">{placeholder}</option>
            )}
            {children}
        </AdminSelect>
    );
});
