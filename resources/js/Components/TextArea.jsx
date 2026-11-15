import { forwardRef } from 'react';
import { AdminTextarea } from '@okjt/dashboard';
import { FIELD_CLASSES } from './fieldClasses';

/** A text area: the OKJT kit's AdminTextarea in Najenga's look. */
export default forwardRef(function TextArea({ className = '', ...props }, ref) {
    return <AdminTextarea bare {...props} ref={ref} baseClassName={FIELD_CLASSES.textarea} className={className} />;
});
