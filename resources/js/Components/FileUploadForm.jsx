import ResourceFormPage from '@/Components/ResourceFormPage';
import FormActions from '@/Components/FormActions';
import SelectInput from '@/Components/SelectInput';
import { router } from '@inertiajs/react';
import { useState, useRef } from 'react';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';

export default function FileUploadForm({ title, breadcrumbs, accept, hint, submitLabel, storeRoute, filesKey, projects }) {
    const [files, setFiles] = useState([]);
    const [fileCount, setFileCount] = useState(0);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selected = Array.from(e.target.files);
        setFiles(selected);
        setFileCount(selected.length);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        files.forEach((file, index) => {
            formData.append(`${filesKey}[${index}]`, file);
        });
        formData.append('project_id', e.target.project_id.value);

        router.post(route(storeRoute), formData, {
            forceFormData: true,
            onSuccess: () => router.visit(route(storeRoute.replace('.store', ''))),
        });
    };

    return (
        <ResourceFormPage title={title} breadcrumbs={breadcrumbs}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <InputLabel value={title} />
                    <div
                        className="mt-2 border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-[#8B0000]/50 transition cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <i className="fas fa-cloud-upload-alt text-4xl text-gray-500 mb-3"></i>
                        <p className="text-gray-400">Click to select files</p>
                        <p className="text-gray-500 text-sm mt-1">{hint}</p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept={accept}
                            multiple
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>
                    {fileCount > 0 && (
                        <p className="text-gray-400 text-sm mt-2">
                            <i className="fas fa-check-circle text-green-400 mr-1"></i>
                            {fileCount} file{fileCount !== 1 ? 's' : ''} selected
                        </p>
                    )}
                </div>

                <div>
                    <InputLabel value="Project" />
                    <SelectInput name="project_id" required>
                        <option value="">Select a project</option>
                        {projects.map((project) => (
                            <option key={project.id} value={project.id}>
                                {project.name}
                            </option>
                        ))}
                    </SelectInput>
                </div>

                <FormActions
                    cancelHref={route(storeRoute.replace('.store', ''))}
                    submitLabel={submitLabel}
                    processing={fileCount === 0}
                    loadingText="Uploading..."
                />
            </form>
        </ResourceFormPage>
    );
}
