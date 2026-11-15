import { forwardRef } from 'react';
import { AdminTextarea } from '@okjt/dashboard';

/** The kit's multi-line field. */
export default forwardRef(function TextArea(props, ref) {
    return <AdminTextarea bare {...props} ref={ref} />;
});
