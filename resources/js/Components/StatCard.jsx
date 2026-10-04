import React from 'react';

export default function StatCard({ icon, label, value, trend }) {
    return (
        <div className="panel p-6">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-gray-400 text-sm mb-1">{label}</p>
                    <p className="text-white text-2xl font-bold">{value}</p>
                    {trend !== undefined && trend !== null && (
                        <div className="flex items-center gap-1 mt-2">
                            <i
                                className={`fas ${
                                    trend >= 0 ? 'fa-arrow-up text-green-400' : 'fa-arrow-down text-red-400'
                                } text-xs`}
                            ></i>
                            <span
                                className={`text-xs font-medium ${
                                    trend >= 0 ? 'text-green-400' : 'text-red-400'
                                }`}
                            >
                                {Math.abs(trend)}%
                            </span>
                        </div>
                    )}
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#8B0000]/15 flex items-center justify-center">
                    <i className={`fas ${icon} text-[#DC143C] text-lg`}></i>
                </div>
            </div>
        </div>
    );
}
