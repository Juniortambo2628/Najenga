import { motion } from 'framer-motion';

export default function ScrollCard({ image, title, subtitle, tags }) {
    return (
        <motion.div
            className="flex-shrink-0 w-[340px] md:w-[400px] group cursor-pointer"
            whileHover={{ y: -8 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
        >
            <div className="relative h-[460px] md:h-[520px] rounded-2xl overflow-hidden">
                <motion.img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                    {tags && tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                            {tags.map((tag, idx) => (
                                <span key={idx} className="landing-card-tag">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                    <h3 className="text-white font-bold text-xl mb-1">{title}</h3>
                    {subtitle && <p className="text-white/60 text-sm">{subtitle}</p>}
                </div>
            </div>
        </motion.div>
    );
}
