import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import imageCompression from 'browser-image-compression';
import axios from 'axios';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

const COMPRESSION_OPTIONS = {
    maxSizeMB: 1.5,
    maxWidthOrHeight: 2048,
    useWebWorker: true,
    initialQuality: 0.8,
    alwaysKeepResolution: false,
};

const BATCH_SIZE = 10;

export default function FileUploadModal({ isOpen, onClose, uploadUrl, acceptedFileTypes, title = "Upload Files", onUploadComplete }) {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState(null);
    const [compressing, setCompressing] = useState(false);
    const [compressionInfo, setCompressionInfo] = useState(null);

    const onDrop = useCallback(async (acceptedFiles) => {
        setCompressing(true);
        setCompressionInfo(null);

        const imageFiles = acceptedFiles.filter(f => f.type.startsWith('image/'));
        const nonImageFiles = acceptedFiles.filter(f => !f.type.startsWith('image/'));
        const compressedImages = [];

        for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i];
            try {
                if (file.size > 500 * 1024) {
                    const compressed = await imageCompression(file, COMPRESSION_OPTIONS);
                    compressedImages.push(Object.assign(compressed, {
                        preview: URL.createObjectURL(compressed),
                        originalName: file.name,
                        originalSize: file.size,
                    }));
                } else {
                    compressedImages.push(Object.assign(file, {
                        preview: URL.createObjectURL(file),
                        originalName: file.name,
                        originalSize: file.size,
                    }));
                }
            } catch {
                compressedImages.push(Object.assign(file, {
                    preview: URL.createObjectURL(file),
                    originalName: file.name,
                    originalSize: file.size,
                }));
            }
        }

        const allNewFiles = [...compressedImages, ...nonImageFiles.map(f => Object.assign(f, { preview: URL.createObjectURL(f) }))];

        const totalOriginal = imageFiles.reduce((sum, f) => sum + f.size, 0);
        const totalCompressed = compressedImages.reduce((sum, f) => sum + f.size, 0);
        if (imageFiles.length > 0 && totalCompressed < totalOriginal) {
            const savedMB = ((totalOriginal - totalCompressed) / 1024 / 1024).toFixed(1);
            const pct = Math.round((1 - totalCompressed / totalOriginal) * 100);
            setCompressionInfo(`${imageFiles.length} images compressed: ${savedMB}MB saved (${pct}% reduction)`);
        }

        setFiles(prev => [...prev, ...allNewFiles]);
        setUploadStatus(null);
        setCompressing(false);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: acceptedFileTypes,
        multiple: true,
        maxFiles: 100,
    });

    const removeFile = (file) => {
        setFiles(prev => prev.filter(f => f !== file));
    };

    const handleUpload = async () => {
        if (files.length === 0) return;

        setUploading(true);
        setProgress(0);

        const fieldName = uploadUrl.includes('documents') ? 'documents[]' : 'photos[]';
        const totalBatches = Math.ceil(files.length / BATCH_SIZE);
        let uploadedCount = 0;
        let failedCount = 0;

        for (let batch = 0; batch < totalBatches; batch++) {
            const start = batch * BATCH_SIZE;
            const end = Math.min(start + BATCH_SIZE, files.length);
            const batchFiles = files.slice(start, end);

            const formData = new FormData();
            batchFiles.forEach(file => {
                formData.append(fieldName, file);
            });

            try {
                const csrfToken = document.head.querySelector('meta[name="csrf-token"]')?.content;
                await axios.post(uploadUrl, formData, {
                    onUploadProgress: (progressEvent) => {
                        const batchProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        const overallProgress = Math.round(((batch * 100 + batchProgress) / (totalBatches * 100)) * 100);
                        setProgress(overallProgress);
                    },
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'X-CSRF-TOKEN': csrfToken,
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });
                uploadedCount += batchFiles.length;
            } catch {
                failedCount += batchFiles.length;
            }
        }

        if (failedCount === 0) {
            setUploadStatus('success');
            setFiles([]);
            if (onUploadComplete) onUploadComplete();
            setTimeout(() => {
                onClose();
                setUploadStatus(null);
                setProgress(0);
            }, 1500);
        } else {
            setUploadStatus('error');
        }

        setUploading(false);
    };

    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    const formatSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    };

    return (
        <Modal show={isOpen} onClose={onClose} maxWidth="2xl">
            <div className="flex justify-between items-center p-6 border-b border-white/10">
                <h3 className="text-xl font-bold text-white">{title}</h3>
                {files.length > 0 && (
                    <span className="text-sm text-gray-400">{files.length} files ({formatSize(totalSize)})</span>
                )}
            </div>

            <div className="p-6">
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors duration-300
                        ${isDragActive ? 'border-[#8B0000] bg-[#8B0000]/10' : 'border-white/20 hover:border-[#8B0000]/50 hover:bg-white/5'}
                    `}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/50 mb-2">
                            {compressing ? (
                                <i className="fas fa-compress-arrows-alt text-3xl animate-pulse text-yellow-400"></i>
                            ) : (
                                <i className="fas fa-cloud-upload-alt text-3xl"></i>
                            )}
                        </div>
                        <p className="text-white font-medium text-lg">
                            {compressing ? 'Compressing images...' :
                             isDragActive ? "Drop files here..." :
                             "Drag & drop files here, or click to select"}
                        </p>
                        <p className="text-gray-500 text-sm">
                            Up to 100 files at once. Images over 500KB are auto-compressed.
                        </p>
                    </div>
                </div>

                {compressionInfo && (
                    <div className="mt-3 p-2 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-xs text-center">
                        <i className="fas fa-check-circle mr-1"></i>{compressionInfo}
                    </div>
                )}

                {files.length > 0 && (
                    <div className="mt-6">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-white font-semibold text-sm">Selected Files ({files.length})</h4>
                            <button
                                onClick={() => setFiles([])}
                                className="text-xs text-red-400 hover:text-red-300"
                            >
                                Clear all
                            </button>
                        </div>
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-3 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                            {files.map((file, index) => (
                                <div key={index} className="relative group bg-white/5 rounded-xl overflow-hidden border border-white/10">
                                    <div className="aspect-square flex items-center justify-center bg-black/50">
                                        {file.type?.startsWith('image/') ? (
                                            <img src={file.preview} className="w-full h-full object-cover" alt="preview" />
                                        ) : (
                                            <i className="fas fa-file-alt text-3xl text-gray-400"></i>
                                        )}
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeFile(file); }}
                                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg"
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/80 px-1.5 py-0.5">
                                        <p className="text-[9px] text-white truncate">{file.originalName || file.name}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {uploading && (
                    <div className="mt-6">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Uploading batch {Math.ceil(progress / (100 / Math.ceil(files.length / BATCH_SIZE)))} of {Math.ceil(files.length / BATCH_SIZE)}...</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-[rgb(139,0,0)] to-[rgb(220,20,60)] h-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                {uploadStatus === 'success' && (
                    <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-xl text-green-400 text-center text-sm font-medium">
                        <i className="fas fa-check-circle mr-2"></i> Upload Complete!
                    </div>
                )}
                {uploadStatus === 'error' && (
                    <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-center text-sm font-medium">
                        <i className="fas fa-exclamation-circle mr-2"></i> Some files failed. Please try again.
                    </div>
                )}
            </div>

            <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                <SecondaryButton onClick={onClose} disabled={uploading}>
                    Cancel
                </SecondaryButton>
                <PrimaryButton onClick={handleUpload} disabled={files.length === 0 || uploading || compressing}>
                    {uploading ? 'Uploading...' : compressing ? 'Compressing...' : `Upload ${files.length} Files`}
                </PrimaryButton>
            </div>
        </Modal>
    );
}
