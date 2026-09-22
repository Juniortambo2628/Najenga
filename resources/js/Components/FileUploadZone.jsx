import { forwardRef } from 'react';
import { buttonProps } from '@/Utils/a11y';

const FileUploadZone = forwardRef(function FileUploadZone({ accept, multiple = true, onFilesSelected, label, description, fileCount = 0 }, ref) {
    return (
        <div>
            <div
                className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-[#8B0000]/50 transition cursor-pointer"
                onClick={() => ref?.current?.click()}
                {...buttonProps(() => ref?.current?.click())}
            >
                <i aria-hidden="true" className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-3"></i>
                <p className="text-gray-400">{label || 'Click to select files'}</p>
                {description && <p className="text-gray-400 text-sm mt-1">{description}</p>}
                <input
                    ref={ref}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={(e) => onFilesSelected?.(Array.from(e.target.files || []))}
                    className="hidden"
                />
            </div>
            {fileCount > 0 && (
                <p className="text-gray-400 text-sm mt-2">
                    <i aria-hidden="true" className="fas fa-check-circle text-green-400 mr-1"></i>
                    {fileCount} file{fileCount !== 1 ? 's' : ''} selected
                </p>
            )}
        </div>
    );
});

export default FileUploadZone;
