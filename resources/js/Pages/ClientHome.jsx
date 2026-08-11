import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectCoverflow } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';
import { useState } from 'react';
import FileUploadModal from '@/Components/FileUploadModal';

export default function ClientHome({ auth, projects = [], recentPhotos = [] }) {
    const user = auth.user;

    // Modal States
    const [uploadType, setUploadType] = useState(null); // 'photo', 'document', 'receipt'

    return (
        <AuthenticatedLayout>
            <Head title="Home" />

            {/* Modals */}
            <FileUploadModal
                isOpen={uploadType === 'photo'}
                onClose={() => setUploadType(null)}
                uploadUrl="/photos"
                acceptedFileTypes={{ 'image/*': [] }}
                title="Upload Photos"
            />
            <FileUploadModal
                isOpen={uploadType === 'document'}
                onClose={() => setUploadType(null)}
                uploadUrl="/documents"
                acceptedFileTypes={{ 
                    'application/pdf': [], 
                    'application/msword': [], 
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
                    'application/vnd.ms-excel': [],
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': []
                }}
                title="Upload Documents"
            />
            {/* Keeping Receipt Verification as a full page for now as it involves complex review, 
                but we could add a quick upload modal later if needed. 
                For the 'Quick Actions' button, user might prefer the full verification flow. */ }

            <div>
                {/* Welcome Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        Welcome back, {user.first_name || user.name}! 👋
                    </h1>
                    <p className="text-xl text-gray-400">
                        Manage your construction projects with ease
                    </p>
                </div>

                {/* Photo Carousel */}
                <div className="mb-12">
                    {recentPhotos.length > 0 ? (
                        <Swiper
                            effect={'coverflow'}
                            grabCursor={true}
                            centeredSlides={true}
                            slidesPerView={'auto'}
                            coverflowEffect={{
                                rotate: 30,
                                stretch: 0,
                                depth: 50,
                                modifier: 1,
                                slideShadows: true,
                            }}
                            autoplay={{
                                delay: 4000,
                                disableOnInteraction: false,
                            }}
                            pagination={{ clickable: true }}
                            navigation={true}
                            modules={[EffectCoverflow, Pagination, Navigation, Autoplay]}
                            className="w-full max-w-5xl !pb-8"
                        >
                            {recentPhotos.map((photo) => (
                                <SwiperSlide key={photo.id} className="w-[640px] h-[360px] rounded-2xl overflow-hidden relative group shadow-2xl border border-white/10 bg-black">
                                    <img 
                                        src={`/storage/${photo.file_path.split('/').map(seg => encodeURIComponent(seg)).join('/')}`} 
                                        alt={photo.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                        <h3 className="text-white font-bold text-lg leading-tight mb-2">{photo.project_name}</h3>
                                        <p className="text-gray-300 text-xs mb-1 flex items-center"><i className="fas fa-map-marker-alt w-4 text-center mr-1"></i>{photo.project_location}</p>
                                        <p className="text-gray-400 text-[10px] flex items-center"><i className="far fa-calendar w-4 text-center mr-1"></i>{photo.created_at_formatted}</p>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    ) : (
                        <div className="text-center py-12 bg-gray-900/50 rounded-3xl border border-white/10 max-w-4xl mx-auto">
                            <i className="fas fa-images text-6xl text-gray-600 mb-4"></i>
                            <h3 className="text-xl font-semibold text-white mb-2">No Photos Yet</h3>
                            <p className="text-gray-400">Start uploading photos to see them here</p>
                            <button 
                                onClick={() => setUploadType('photo')}
                                className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition"
                            >
                                Upload Now
                            </button>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Projects Dashboard Card */}
                    <div className="bg-gray-900/50 border border-white/10 rounded-3xl p-8 text-center hover:border-white/30 transition shadow-2xl backdrop-blur-sm">
                        <i className="fas fa-project-diagram text-5xl text-[#8B0000] mb-4"></i>
                        <h3 className="text-2xl font-bold text-white mb-3">Projects Dashboard</h3>
                        <p className="text-gray-400 mb-6">
                            View all your projects, expenses, documents, and timeline
                        </p>
                        <Link 
                            href={route('dashboard')} 
                            className="inline-flex items-center justify-center w-full px-6 py-4 bg-gradient-to-r from-[rgb(139,0,0)] to-[rgb(220,20,60)] text-white rounded-xl font-bold hover:shadow-lg hover:scale-[1.02] transition duration-300"
                        >
                            <i className="fas fa-tachometer-alt mr-2"></i>
                            Go to Dashboard
                        </Link>
                    </div>

                    {/* Quick Upload Card */}
                    <div className="bg-gray-900/50 border border-white/10 rounded-3xl p-8 text-center hover:border-white/30 transition shadow-2xl backdrop-blur-sm">
                        <i className="fas fa-bolt text-5xl text-yellow-400 mb-4"></i>
                        <h3 className="text-2xl font-bold text-white mb-3">Quick Actions</h3>
                        <p className="text-gray-400 mb-6">
                            Upload receipts, take photos, or add documents instantly
                        </p>
                        
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link href="/receipt-verification" className="flex items-center gap-3 px-5 py-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:border-yellow-400/50 transition group">
                                <span className="w-8 h-8 rounded-full bg-yellow-400/20 flex items-center justify-center text-yellow-400 group-hover:scale-110 transition"><i className="fas fa-receipt"></i></span>
                                <span className="text-white font-medium">Upload Receipt</span>
                            </Link>
                            <button onClick={() => setUploadType('photo')} className="flex items-center gap-3 px-5 py-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:border-cyan-400/50 transition group">
                                <span className="w-8 h-8 rounded-full bg-cyan-400/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition"><i className="fas fa-camera"></i></span>
                                <span className="text-white font-medium">Add Photo</span>
                            </button>
                            <button onClick={() => setUploadType('document')} className="flex items-center gap-3 px-5 py-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:border-red-500/50 transition group">
                                <span className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 group-hover:scale-110 transition"><i className="fas fa-file-pdf"></i></span>
                                <span className="text-white font-medium">Upload Doc</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
