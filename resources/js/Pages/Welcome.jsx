import { Head, Link } from '@inertiajs/react';
import HeroSection from '@/Components/Landing/HeroSection';
import ScrollSection from '@/Components/Landing/ScrollSection';
import ScrollReveal from '@/Components/Landing/ScrollReveal';


const FEATURES = [
    {
        icon: 'receipt',
        title: 'Smart Receipts',
        subtitle: 'AI-Powered OCR',
        description: 'Automatic data extraction from receipts',
        image: '/Najenga-backgrounds/pexels-artbovich-7031408.jpg',
        tags: ['OCR', 'Automation'],
        colorClass: 'bg-gradient-to-br from-[rgb(139,0,0)] to-[rgb(220,20,60)]',
    },
    {
        icon: 'camera',
        title: 'Progress Photos',
        subtitle: 'Visual Tracking',
        description: 'Document your project journey with organized galleries',
        image: '/Najenga-backgrounds/pexels-clement-proust-363898785-31763541.jpg',
        tags: ['Photos', 'Annotations'],
        colorClass: 'bg-gradient-to-br from-pink-500 to-rose-500',
    },
    {
        icon: 'chart-line',
        title: 'Analytics',
        subtitle: 'Real-time Reports',
        description: 'Get instant insights into expenses and timelines',
        image: '/Najenga-backgrounds/pexels-d-goug-211350543-38210397.jpg',
        tags: ['Analytics', 'Reports'],
        colorClass: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    },
    {
        icon: 'users',
        title: 'Team Work',
        subtitle: 'Collaboration',
        description: 'Share projects with team members and clients',
        image: '/Najenga-backgrounds/pexels-kelly-28964416.jpg',
        tags: ['Team', 'Sharing'],
        colorClass: 'bg-gradient-to-br from-orange-500 to-amber-500',
    },
    {
        icon: 'file-pdf',
        title: 'Documents',
        subtitle: 'Management',
        description: 'Store and organize all project documents securely',
        image: '/Najenga-backgrounds/pexels-ninobur-16803023.jpg',
        tags: ['Files', 'PDF'],
        colorClass: 'bg-gradient-to-br from-teal-400 to-emerald-400',
    },
    {
        icon: 'mobile-alt',
        title: 'Mobile',
        subtitle: 'On-the-go',
        description: 'Access your projects from anywhere',
        image: '/Najenga-backgrounds/pexels-vip-foto-8491089.jpg',
        tags: ['Mobile', 'Responsive'],
        colorClass: 'bg-gradient-to-br from-orange-300 to-rose-300',
    },
];

const BENEFITS = [
    {
        title: 'Save Time',
        subtitle: 'Automation',
        description: 'Automate tedious tasks and focus on what matters most',
        image: '/Najenga-backgrounds/pexels-curtis-adams-1694007-7027840.jpg',
        tags: ['Efficiency', 'Speed'],
    },
    {
        title: 'Reduce Costs',
        subtitle: 'Budget Control',
        description: 'Track expenses and stay within budget effortlessly',
        image: '/Najenga-backgrounds/pexels-expect-best-79873-323776.jpg',
        tags: ['Savings', 'Tracking'],
    },
    {
        title: 'Stay Secure',
        subtitle: 'Data Protection',
        description: 'Bank-level encryption keeps your project data safe',
        image: '/Najenga-backgrounds/pexels-pavel-danilyuk-7937735.jpg',
        tags: ['Security', 'Encryption'],
    },
    {
        title: '24/7 Support',
        subtitle: 'Always Available',
        description: 'Our team is here whenever you need assistance',
        image: '/Najenga-backgrounds/pexels-ninobur-16787444.jpg',
        tags: ['Support', 'Help'],
    },
    {
        title: 'Scale Freely',
        subtitle: 'Growth Ready',
        description: 'From small renovations to large commercial projects',
        image: '/Najenga-backgrounds/pexels-500photos-com-15338-93375.jpg',
        tags: ['Scale', 'Flexible'],
    },
];

const TESTIMONIALS = [
    {
        title: 'John Mwangi',
        subtitle: 'Project Manager, Nairobi',
        description: 'Najenga has transformed how we manage our construction projects. The OCR receipt scanning alone saves us hours every week!',
        image: '/Najenga-backgrounds/pexels-artbovich-7031607.jpg',
        tags: ['5 Stars', 'Verified'],
    },
    {
        title: 'Sarah Kamau',
        subtitle: 'Contractor, Mombasa',
        description: 'The photo documentation feature is incredible. Our clients love seeing real-time progress updates with annotated photos.',
        image: '/Najenga-backgrounds/pexels-clement-proust-363898785-31771167.jpg',
        tags: ['5 Stars', 'Verified'],
    },
    {
        title: 'Daniel Obam',
        subtitle: 'Builder, Busia',
        description: 'Finally, a construction management tool that actually understands our needs. Highly recommend Najenga!',
        image: '/Najenga-backgrounds/pexels-40037226-7667625.jpg',
        tags: ['5 Stars', 'Verified'],
    },
];

export default function Welcome({ auth }) {
    return (
        <div className="w-full">
            <Head title="Najenga - Professional Construction Management Platform" />

            <HeroSection auth={auth} />

            {/* Features Section */}
            <ScrollSection
                id="features"
                title="Features"
                description="Everything you need to manage your construction projects efficiently. AI-powered tools, real-time tracking, and seamless collaboration."
                buttonText="Get Started"
                buttonHref="/register"
                cards={FEATURES}
            />

            {/* Benefits Section */}
            <ScrollSection
                id="benefits"
                title="Benefits"
                description="Built by construction professionals, for construction professionals. Experience the difference that modern technology brings to your projects."
                buttonText="Learn More"
                buttonHref="#testimonials"
                cards={BENEFITS}
                reverse
            />

            {/* Testimonials Section */}
            <ScrollSection
                id="testimonials"
                title="Clients"
                description="Trusted by construction professionals across Kenya. See what our clients have to say about their experience with Najenga."
                buttonText="Join Them"
                buttonHref="/register"
                cards={TESTIMONIALS}
            />

            {/* CTA Section */}
            <section className="min-h-screen flex items-center relative overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <img
                        src="/Najenga-backgrounds/pexels-kelly-28964416.jpg"
                        alt="Construction team"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-[rgb(139,0,0)]/85 via-[rgb(139,0,0)]/70 to-[rgb(220,20,60)]/85" />
                </div>
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:50px_50px]"></div>
                </div>
                <div className="w-full px-8 md:px-16 lg:px-24 text-center relative z-10">
                    <ScrollReveal>
                        <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 uppercase leading-tight">
                            Ready to Transform<br />Your Projects?
                        </h2>
                    </ScrollReveal>
                    <ScrollReveal delay={0.15}>
                        <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10">
                            Join construction professionals who trust Najenga to manage their projects efficiently
                        </p>
                    </ScrollReveal>
                    <ScrollReveal delay={0.3}>
                        <div className="flex flex-wrap justify-center gap-4 mb-8">
                            <a href="/register" className="landing-cta-brand">
                                Get Started
                            </a>
                            <a href="/login" className="landing-cta-secondary">
                                Login
                            </a>
                        </div>
                        <p className="text-white/70 text-sm">
                            <i className="fas fa-check-circle mr-2"></i>
                            No credit card required &bull; Free 30-day trial &bull; Cancel anytime
                        </p>
                    </ScrollReveal>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-16 bg-black border-t border-white/10">
                <div className="container mx-auto px-4">
                    <ScrollReveal>
                        <div className="grid md:grid-cols-4 gap-8">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <img src="/Najenga-logos/Najenga-Logo-header-footer-logo-transparent.png" alt="Najenga" className="h-16" />
                                </div>
                                <p className="text-gray-400">
                                    Streamlining construction project management with modern technology.
                                </p>
                                <p className="text-gray-500 mt-2">
                                    <strong>Powered by OKJ Technologies</strong>
                                </p>
                            </div>
                            <div>
                                <h6 className="text-white font-bold mb-4">Product</h6>
                                <ul className="space-y-2 text-gray-400">
                                    <li><a href="#features" className="hover:text-white transition">Features</a></li>
                                    <li><a href="#benefits" className="hover:text-white transition">Benefits</a></li>
                                    <li><a href="#testimonials" className="hover:text-white transition">Testimonials</a></li>
                                </ul>
                            </div>
                            <div>
                                <h6 className="text-white font-bold mb-4">Company</h6>
                                <ul className="space-y-2 text-gray-400">
                                    <li><a href="#" className="hover:text-white transition">About Us</a></li>
                                    <li><a href="mailto:support@okjtech.co.ke" className="hover:text-white transition">Contact</a></li>
                                    <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                                </ul>
                            </div>
                            <div>
                                <h6 className="text-white font-bold mb-4">Support</h6>
                                <ul className="space-y-2 text-gray-400">
                                    <li><Link href="/login" className="hover:text-white transition">Login</Link></li>
                                    <li><Link href="/register" className="hover:text-white transition">Register</Link></li>
                                </ul>
                            </div>
                        </div>
                        <div className="border-t border-white/10 mt-12 pt-8 text-center text-gray-500">
                            <p>&copy; {new Date().getFullYear()} Najenga by OKJ Technologies. All rights reserved.</p>
                        </div>
                    </ScrollReveal>
                </div>
            </footer>
        </div>
    );
}
