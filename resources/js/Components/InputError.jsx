/** A field's error message. `light` for light backgrounds (the sign-in pages). */
export default function InputError({ message, className = '', light = false, ...props }) {
    return message ? (
        <p
            {...props}
            className={`text-xs ${light ? 'pl-5 text-red-600' : 'text-red-400'} mt-1.5 ${className}`}
        >
            {message}
        </p>
    ) : null;
}
