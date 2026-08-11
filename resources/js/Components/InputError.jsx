export default function InputError({ message, className = '', ...props }) {
    return message ? (
        <p
            {...props}
            className={'text-xs text-red-400 mt-1.5 ' + className}
        >
            {message}
        </p>
    ) : null;
}
