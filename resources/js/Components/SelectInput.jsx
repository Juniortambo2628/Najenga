import { forwardRef } from 'react';
import { AdminSelect } from '@okjt/dashboard';

/** The kit's select. `placeholder` adds an empty first option. */
export default forwardRef(function SelectInput({ placeholder, children, ...props }, ref) {
    return (
        <AdminSelect bare {...props} ref={ref}>
            {placeholder && <option value="">{placeholder}</option>}
            {children}
        </AdminSelect>
    );
});
