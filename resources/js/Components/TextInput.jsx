import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { AdminInput } from '@okjt/dashboard';
import { FIELD_CLASSES } from './fieldClasses';

/** A text field: the OKJT kit's AdminInput in Najenga's look, with `isFocused` to focus it on mount. */
export default forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, ...props },
    ref,
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return <AdminInput bare {...props} type={type} baseClassName={FIELD_CLASSES.input} className={className} ref={localRef} />;
});
