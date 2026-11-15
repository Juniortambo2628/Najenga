import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { AdminInput } from '@okjt/dashboard';

/** The kit's text field. `isFocused` focuses it when it appears. */
export default forwardRef(function TextInput({ type = 'text', isFocused = false, ...props }, ref) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) localRef.current?.focus();
    }, [isFocused]);

    return <AdminInput bare {...props} type={type} ref={localRef} />;
});
