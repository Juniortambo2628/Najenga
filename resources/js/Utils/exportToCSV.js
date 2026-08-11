export function exportToCSV(headers, rows, filename = 'export.csv') {
    const escape = (value) => {
        const str = String(value ?? '');
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const headerLine = headers.map((h) => escape(h.label)).join(',');

    const dataLines = rows.map((row) =>
        headers.map((h) => escape(row[h.key])).join(','),
    );

    const csv = [headerLine, ...dataLines].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
