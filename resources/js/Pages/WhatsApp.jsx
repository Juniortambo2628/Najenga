import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function WhatsApp() {
    return (
        <AuthenticatedLayout>
            <Head title="WhatsApp Integration" />

            <div>
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-white">WhatsApp Integration</h1>
                            <p className="text-gray-400 mt-1">Manage WhatsApp notifications and settings</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-8">
                            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                                <i className="fab fa-whatsapp text-green-400 text-2xl mr-3"></i>
                                Connection Status
                            </h3>
                            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center mb-6">
                                <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                                <span className="text-green-400 font-medium">Connected</span>
                            </div>
                            <p className="text-gray-400 text-sm mb-6">
                                Your account is connected to receive project updates via WhatsApp.
                            </p>
                            <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl transition">
                                Test Connection
                            </button>
                        </div>

                        <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-8">
                            <h3 className="text-xl font-semibold text-white mb-4">Notification Settings</h3>
                            <div className="space-y-4">
                                {['New Expense Added', 'Project Status Update', 'Document Uploaded'].map((setting) => (
                                    <div key={setting} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                        <span className="text-gray-300">{setting}</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked />
                                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#8B0000] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
