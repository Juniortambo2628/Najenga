export default function Badge({ children, variant = 'brand', className = '' }) {
    const variants = {
        brand: 'bg-gradient-to-r from-[rgb(139,0,0)] to-[rgb(220,20,60)] text-white',
        glass: 'bg-white/10 backdrop-blur-md border border-white/20 text-white',
        outline: 'border border-white/30 text-white/80',
    };

    return (
        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
}
