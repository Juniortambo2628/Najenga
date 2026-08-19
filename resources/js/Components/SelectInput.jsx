import { forwardRef } from 'react';

export default forwardRef(function SelectInput(
    { options = [], placeholder, className = '', children, ...props },
    ref,
) {
    return (
        <select
            {...props}
            ref={ref}
            className={
                'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white transition-all duration-200 focus:outline-none focus:border-[#8B0000] focus:ring-1 focus:ring-[#8B0000]/50 disabled:opacity-50 disabled:cursor-not-allowed appearance-none bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%2712%27%20height%3D%2712%27%20viewBox%3D%270%200%2024%2024%27%20fill%3D%27none%27%20stroke%3D%27rgba(255,255,255,0.5)%27%20stroke-width%3D%272%27%3E%3Cpath%20d%3D%27M6%209l6%206%206-6%27/%3E%3C/svg%3E")] bg-no-repeat bg-[right_1rem_center] pr-10 ' +
                className
            }
        >
            {placeholder && (
                <option value="" className="bg-gray-900 text-gray-400">{placeholder}</option>
            )}
            {children}
        </select>
    );
});
