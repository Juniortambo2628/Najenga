import { useCallback } from 'react';

export default function useFileDownload() {
    const download = useCallback((filePath, filename) => {
        const parts = filePath.split('/');
        const encoded = parts.map(encodeURIComponent).join('/');
        const link = document.createElement('a');
        link.href = `/storage/${encoded}`;
        link.download = filename || parts[parts.length - 1];
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, []);

    return download;
}
