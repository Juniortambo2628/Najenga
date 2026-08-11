import { forwardRef } from 'react';

export default forwardRef(function TextArea({ className = '', ...props }, ref) {
    return (
        <textarea
            {...props}
            ref={ref}
            className={
                'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 transition-all duration-200 focus:outline-none focus:border-[#8B0000] focus:ring-1 focus:ring-[#8B0000]/50 resize-none ' +
                className
            }
        />
    );
});
