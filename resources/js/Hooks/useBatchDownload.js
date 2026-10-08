import { useCallback } from 'react';
import axios from 'axios';

export default function useBatchDownload() {
    const download = useCallback(async (url, ids, fallbackName) => {
        try {
            const res = await axios.post(url, { ids }, { responseType: 'blob' });
            const disposition = res.headers['content-disposition'] || '';
            const match = disposition.match(/filename="?([^";]+)"?/);
            const blobUrl = window.URL.createObjectURL(
                new Blob([res.data], { type: 'application/zip' })
            );
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = match ? match[1] : fallbackName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
            return true;
        } catch {
            return false;
        }
    }, []);

    return download;
}
