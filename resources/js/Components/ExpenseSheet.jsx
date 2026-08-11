import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule, ValidationModule, themeQuartz, colorSchemeDark } from 'ag-grid-community';
import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { router } from '@inertiajs/react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS, PAYMENT_LABELS, PAYMENT_METHOD_VALUES } from '@/Config/expenses';

ModuleRegistry.registerModules([AllCommunityModule, ValidationModule]);

const CATEGORIES = EXPENSE_CATEGORIES;

const STORAGE_KEY = 'najenga_expense_draft';
let _nextRowId = 100000;

function generateRowId() {
    return `_draft_${Date.now()}_${_nextRowId++}`;
}

const HEADER_ALIASES = {
    name: 'title', item: 'title', itemname: 'title', expense: 'title',
    expenseitem: 'title', what: 'title', detail: 'title', particulars: 'title',
    expensehead: 'title', head: 'title', particular: 'title', narration: 'title',
    narrationdetails: 'title', ledger: 'title', ledgername: 'title',

    ref: 'reference_number', reference: 'reference_number', refno: 'reference_number',
    refnumber: 'reference_number', referencenumber: 'reference_number',
    transactionid: 'reference_number', transactionref: 'reference_number',
    receiptno: 'reference_number', receiptnumber: 'reference_number',
    confirmation: 'reference_number', code: 'reference_number',
    transref: 'reference_number', txnid: 'reference_number', voucher: 'reference_number',
    voucherno: 'reference_number', invoiceno: 'reference_number', billno: 'reference_number',

    date: 'expense_date', expensedate: 'expense_date', paymentdate: 'expense_date',
    transactiondate: 'expense_date', trandate: 'expense_date', transdate: 'expense_date',
    day: 'expense_date', billdate: 'expense_date', invoicedate: 'expense_date',
    entrydate: 'expense_date', postingdate: 'expense_date', datex: 'expense_date',

    notes: 'description', memo: 'description', remark: 'description',
    remarks: 'description', comment: 'description', comments: 'description',
    details: 'description', narrationtext: 'description', desc: 'description',
    detailsnarration: 'description', narr: 'description',

    paymentmethod: 'payment_method', paymethod: 'payment_method',
    paymentmode: 'payment_method', paymenttype: 'payment_method',
    method: 'payment_method', mode: 'payment_method', type: 'payment_method',
    payvia: 'payment_method', paidvia: 'payment_method', payby: 'payment_method',
    paidby: 'payment_method', paymentby: 'payment_method',
    payment: 'payment_method',

    cat: 'category', category: 'category', typeofexpense: 'category',
    expensetype: 'category', group: 'category', subgroup: 'category',
    nature: 'category', account: 'category', accountname: 'category',
    headname: 'category', ledgerhead: 'category',

    amount: 'amount', value: 'amount', cost: 'amount', price: 'amount',
    total: 'amount', sum: 'amount', kesh: 'amount', kes: 'amount',
    amt: 'amount', debit: 'amount',
    paid: 'amount', net: 'amount', gross: 'amount', subtotal: 'amount',
    grandtotal: 'amount',

    recipient: 'recipient', payee: 'recipient', vendor: 'recipient',
    supplier: 'recipient', to: 'recipient', paidto: 'recipient',
    sentto: 'recipient', merchant: 'recipient', company: 'recipient',
    business: 'recipient', person: 'recipient', payeeName: 'recipient',
    vendorname: 'recipient', suppliername: 'recipient', party: 'recipient',
    partyname: 'recipient', beneficiary: 'recipient', receiver: 'recipient',

    purpose: 'purpose', reason: 'purpose', for: 'purpose', use: 'purpose',
    usage: 'purpose', justification: 'purpose', expensepurpose: 'purpose',
    paymentpurpose: 'purpose', typeofpayment: 'purpose',

    time: 'time', timestamp: 'time', transtime: 'time', transacttime: 'time',
};

const MAPPED_FIELDS = new Set([
    'title', 'reference_number', 'expense_date', 'description',
    'payment_method', 'category', 'amount', 'recipient', 'purpose', 'time',
]);

function normalizeRow(row) {
    const normalized = {};
    Object.keys(row).forEach((k) => {
        const key = String(k).trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
        const mappedKey = HEADER_ALIASES[key] || (MAPPED_FIELDS.has(key) ? key : null);
        if (mappedKey) {
            normalized[mappedKey] = row[k] == null ? '' : String(row[k]).trim();
        } else if (key && !['sno', 'slno', 'srno', 'serialno', 'no', ' sno'].includes(key)) {
            if (!normalized._unmapped) normalized._unmapped = [];
            normalized._unmapped.push({ header: k, value: row[k] });
        }
    });

    let amount = normalized.amount || '';
    amount = amount.replace(/(?:KES|Ksh|UGX|USD|\$|EUR|GBP|TZS|NGN|ZAR|€|£)\s*/gi, '');
    amount = amount.replace(/,/g, '');
    amount = parseFloat(amount) || 0;

    let date = normalized.expense_date || '';
    if (date) {
        const months = { jan:'01', feb:'02', mar:'03', apr:'04', may:'05', jun:'06', jul:'07', aug:'08', sep:'09', oct:'10', nov:'11', dec:'12' };
        const monMatch = date.match(/^(\d{1,2})[\-\/\.](\w{3})[\-\/\.](\d{2,4})$/i);
        if (monMatch && months[monMatch[2].toLowerCase()]) {
            const day = monMatch[1].padStart(2, '0');
            const month = months[monMatch[2].toLowerCase()];
            let year = monMatch[3];
            if (year.length === 2) year = (parseInt(year) < 50 ? '20' : '19') + year;
            date = `${year}-${month}-${day}`;
        } else {
            const parts = date.split(/[\-\/\.]/);
            if (parts.length === 3) {
                const [a, b, c] = parts;
                let day, month, year;
                if (a.length === 4) { year = a; month = b; day = c; }
                else { day = a; month = b; year = c; }
                if (year.length === 2) year = (parseInt(year) < 50 ? '20' : '19') + year;
                day = day.padStart(2, '0');
                month = month.padStart(2, '0');
                date = `${year}-${month}-${day}`;
            }
        }
    }

    let paymentMethod = (normalized.payment_method || '').toLowerCase().trim();
    if (['m-pesa', 'mpesa', 'm pesa', 'lipa na', 'pay bill', 'buy goods'].some(v => paymentMethod.includes(v))) {
        paymentMethod = 'mobile_money';
    } else if (paymentMethod.includes('pesalink') || paymentMethod.includes('pesa link')) {
        paymentMethod = 'pesalink';
    } else if (paymentMethod.includes('cash')) {
        paymentMethod = 'cash';
    } else if (paymentMethod.includes('bank') || paymentMethod.includes('transfer')) {
        paymentMethod = 'bank_transfer';
    } else if (paymentMethod.includes('card') || paymentMethod.includes('visa') || paymentMethod.includes('master') || paymentMethod.includes('credit')) {
        paymentMethod = 'card';
    } else if (paymentMethod.includes('cheque') || paymentMethod.includes('check')) {
        paymentMethod = 'check';
    } else if (!PAYMENT_METHOD_VALUES.includes(paymentMethod)) {
        paymentMethod = 'other';
    }

    let refNumber = normalized.reference_number || '';
    if (!refNumber && normalized._unmapped) {
        for (const u of normalized._unmapped) {
            const v = String(u.value || '').trim();
            if (/^[A-Z0-9]{5,20}$/i.test(v)) {
                refNumber = v;
                break;
            }
        }
    }

    return {
        _rowId: generateRowId(),
        title: normalized.title || normalized.recipient || '',
        recipient: normalized.recipient || '',
        category: CATEGORIES.includes(normalized.category) ? normalized.category : 'Other',
        amount,
        expense_date: date || new Date().toISOString().slice(0, 10),
        time: normalized.time || '',
        reference_number: refNumber,
        purpose: normalized.purpose || '',
        payment_method: paymentMethod,
        description: normalized.description || '',
        project_id: null,
        status: 'draft',
    };
}

function detectDelimiter(text) {
    const firstLine = text.split('\n')[0] || '';
    const counts = {
        '\t': (firstLine.match(/\t/g) || []).length,
        ',': (firstLine.match(/,/g) || []).length,
        ';': (firstLine.match(/;/g) || []).length,
    };
    if (counts['\t'] >= counts[','] && counts['\t'] >= counts[';'] && counts['\t'] > 0) return '\t';
    if (counts[','] >= counts[';'] && counts[','] > 0) return ',';
    if (counts[';'] > 0) return ';';
    return '\t';
}

function splitCsvLine(line, delimiter) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (inQuotes) {
            if (ch === '"' && line[i + 1] === '"') {
                current += '"';
                i++;
            } else if (ch === '"') {
                inQuotes = false;
            } else {
                current += ch;
            }
        } else {
            if (ch === '"') {
                inQuotes = true;
            } else if (ch === delimiter) {
                result.push(current);
                current = '';
            } else {
                current += ch;
            }
        }
    }
    result.push(current);
    return result;
}

function matchHeader(rawHeader) {
    const h = rawHeader.trim().toLowerCase();
    if (!h) return null;

    const clean = h.replace(/[^a-z0-9_]/g, '');
    if (HEADER_ALIASES[clean]) return HEADER_ALIASES[clean];

    let bestMatch = null;
    let bestLen = 0;
    for (const [alias, field] of Object.entries(HEADER_ALIASES)) {
        if (clean.includes(alias) && alias.length > bestLen) {
            bestMatch = field;
            bestLen = alias.length;
        }
    }
    if (bestMatch) return bestMatch;

    for (const [alias, field] of Object.entries(HEADER_ALIASES)) {
        if (h.includes(alias) || alias.includes(h)) return field;
    }

    if (/^(s\/?no|sl\/?no|sr\/?no|serial|no\.?|#|index)$/i.test(h)) return null;
    return null;
}

const POSITIONAL_MAP_6 = ['expense_date', 'time', 'amount', 'recipient', 'reference_number', 'purpose'];
const POSITIONAL_MAP_7 = ['expense_date', 'time', 'amount', 'recipient', 'payment_method', 'reference_number', 'purpose'];
const POSITIONAL_MAP_8 = ['expense_date', 'time', 'amount', 'recipient', 'payment_method', 'reference_number', 'purpose', null];

function inferPositionalHeaders(rawHeaders, firstDataRow) {
    const count = rawHeaders.length;
    const posMap = count === 6 ? POSITIONAL_MAP_6 : count === 7 ? POSITIONAL_MAP_7 : count >= 8 ? POSITIONAL_MAP_8 : null;
    if (!posMap) return null;

    const headers = [];
    for (let i = 0; i < count; i++) {
        const val = (firstDataRow[i] || '').trim();
        const expected = posMap[i] || null;

        if (expected === 'amount') {
            const cleaned = val.replace(/(?:KES|Ksh|UGX|USD|\$|EUR|GBP)\s*/gi, '').replace(/,/g, '');
            if (/^\d+\.?\d*$/.test(cleaned)) headers.push('amount');
            else headers.push(expected);
        } else if (expected === 'expense_date') {
            if (/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/.test(val) || /\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}/.test(val)) {
                headers.push('expense_date');
            } else headers.push(expected);
        } else if (expected === 'reference_number') {
            if (/^[A-Za-z0-9]{6,20}$/.test(val)) headers.push('reference_number');
            else headers.push(expected);
        } else {
            headers.push(expected);
        }
    }
    return headers;
}

function parseTabDelimited(text) {
    const trimmed = text.replace(/\r\n/g, '\n').replace(/\r/g, '').trim();
    if (!trimmed) return { rows: [], unmappedHeaders: [] };

    const delimiter = detectDelimiter(trimmed);
    const lines = trimmed.split('\n').filter(l => l.trim());
    if (lines.length === 0) return { rows: [], unmappedHeaders: [] };

    const rawHeaders = splitCsvLine(lines[0], delimiter).map(h => h.trim());
    const unmappedHeaders = [];

    let headers = rawHeaders.map(h => {
        const mapped = matchHeader(h);
        if (!mapped) {
            const clean = h.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
            if (clean && !/^(s\/?no|sl\/?no|sr\/?no|serial|no\.?|#|index|date|time|amount|kes|recipient|payment|method|reference|number|purpose|receipt|description)$/i.test(clean)) {
                unmappedHeaders.push(h);
            }
        }
        return mapped;
    });

    const mappedCount = headers.filter(Boolean).length;
    if (mappedCount < 3 && lines.length > 1) {
        const firstRow = splitCsvLine(lines[1], delimiter);
        const posHeaders = inferPositionalHeaders(rawHeaders, firstRow);
        if (posHeaders) {
            headers = posHeaders;
            unmappedHeaders.length = 0;
            for (let i = 0; i < rawHeaders.length; i++) {
                if (!posHeaders[i]) {
                    unmappedHeaders.push(rawHeaders[i]);
                }
            }
        }
    }

    const rows = [];
    for (let i = 1; i < lines.length; i++) {
        const cells = splitCsvLine(lines[i], delimiter);
        if (cells.length < 1) continue;

        const raw = {};
        headers.forEach((mappedKey, idx) => {
            if (mappedKey && idx < cells.length) {
                raw[mappedKey] = cells[idx]?.trim() || '';
            }
        });

        const normalized = normalizeRow(raw);
        if (normalized.title || normalized.amount) {
            rows.push(normalized);
        }
    }
    return { rows, unmappedHeaders };
}

function parseSpreadsheet(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = new Uint8Array(ev.target.result);
                const wb = XLSX.read(data, { type: 'array' });
                const firstSheet = wb.SheetNames[0];
                if (!firstSheet) { resolve({ rows: [], unmappedHeaders: [] }); return; }
                const json = XLSX.utils.sheet_to_json(wb.Sheets[firstSheet], { defval: '' });
                const unmappedHeaders = [];
                const rows = json.map(normalizeRow).filter((r) => {
                    if (r.title || r.amount) return true;
                    return false;
                });
                resolve({ rows, unmappedHeaders });
            } catch (err) { reject(err); }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file);
    });
}

function loadDraft() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const data = JSON.parse(saved);
            if (Array.isArray(data) && data.length > 0) return data;
        }
    } catch {}
    return null;
}

function saveDraft(rows) {
    try {
        const unsaved = rows.filter(r => !r.id);
        if (unsaved.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(unsaved));
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    } catch {}
}

export default function ExpenseSheet({ expenses, projects = [], defaultProjectId = null }) {
    const fileInputRef = useRef(null);
    const gridRef = useRef(null);
    const gridContainerRef = useRef(null);
    const receiptInputRef = useRef(null);

    const [rowData, setRowData] = useState(() => {
        const draft = loadDraft();
        if (draft && draft.length > 0) return draft;
        return expenses || [];
    });
    const [selectedRows, setSelectedRows] = useState([]);
    const [importing, setImporting] = useState(false);
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [saveStatus, setSaveStatus] = useState('saved');
    const [pastePreview, setPastePreview] = useState(null);
    const [receiptVerifyRow, setReceiptVerifyRow] = useState(null);
    const [receiptAnalyzing, setReceiptAnalyzing] = useState(false);
    const [receiptData, setReceiptData] = useState(null);

    const unsavedCount = useMemo(() => rowData.filter(r => !r.id).length, [rowData]);
    const hasChanges = unsavedCount > 0;

    useEffect(() => {
        setRowData(expenses || []);
    }, [expenses]);

    useEffect(() => {
        saveDraft(rowData);
        if (hasChanges) setSaveStatus('unsaved');
    }, [rowData, hasChanges]);

    useEffect(() => {
        const handler = (e) => {
            if (hasChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [hasChanges]);

    const totalAmount = useMemo(() =>
        rowData.reduce((sum, r) => sum + (Number(r.amount) || 0), 0),
    [rowData]);

    const categoryBreakdown = useMemo(() => {
        const map = {};
        rowData.forEach(r => {
            const cat = r.category || 'Other';
            if (!map[cat]) map[cat] = { count: 0, total: 0 };
            map[cat].count++;
            map[cat].total += Number(r.amount) || 0;
        });
        return Object.entries(map).sort((a, b) => b[1].total - a[1].total);
    }, [rowData]);

    const paymentBreakdown = useMemo(() => {
        const map = {};
        rowData.forEach(r => {
            const pm = PAYMENT_LABELS[r.payment_method] || r.payment_method || 'Unknown';
            if (!map[pm]) map[pm] = { count: 0, total: 0 };
            map[pm].count++;
            map[pm].total += Number(r.amount) || 0;
        });
        return Object.entries(map).sort((a, b) => b[1].total - a[1].total);
    }, [rowData]);

    const handleBatchSave = useCallback(async () => {
        const unsaved = rowData.filter(r => !r.id);
        if (unsaved.length === 0) {
            toast.success('All rows are already saved');
            return;
        }
        setSaveStatus('saving');
        try {
            const res = await fetch('/expenses/batch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': decodeURIComponent(
                        document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] || ''
                    ),
                },
                body: JSON.stringify({ expenses: unsaved.map(r => ({
                    title: r.title,
                    amount: r.amount,
                    category: r.category,
                    project_id: r.project_id,
                    expense_date: r.expense_date,
                    description: r.description,
                    payment_method: r.payment_method,
                    recipient: r.recipient,
                    reference_number: r.reference_number,
                    purpose: r.purpose,
                    time: r.time,
                    currency: r.currency || 'KES',
                    status: r.status || 'draft',
                }))}),
            });
            const data = await res.json();
            if (data.saved_count > 0) {
                setRowData(prev => {
                    const next = [...prev];
                    data.saved.forEach(s => {
                        const idx = next.findIndex(r => r._rowId === unsaved[s.index]?._rowId);
                        if (idx !== -1) next[idx] = { ...next[idx], id: s.id };
                    });
                    return next;
                });
                toast.success(`Saved ${data.saved_count} expenses${data.error_count > 0 ? ` (${data.error_count} failed)` : ''}`);
                setSaveStatus('saved');
                localStorage.removeItem(STORAGE_KEY);
                router.reload({ only: ['expenses'] });
            }
            if (data.error_count > 0) {
                toast.error(`${data.error_count} rows failed to save`);
                setSaveStatus('error');
            }
        } catch (err) {
            toast.error('Failed to save: ' + err.message);
            setSaveStatus('error');
        }
    }, [rowData]);

    const columnDefs = useMemo(() => ([
        {
            field: 'status',
            headerName: '',
            width: 40,
            pinned: 'left',
            cellRenderer: (p) => {
                if (p.data?.id) return '<span title="Saved" style="color:#22c55e"><i class="fas fa-check-circle"></i></span>';
                return '<span title="Unsaved draft" style="color:#eab308"><i class="fas fa-clock"></i></span>';
            },
            resizable: false,
            sortable: false,
            filter: false,
        },
        { field: 'title', headerName: 'Title', editable: true, flex: 1.2, minWidth: 140 },
        { field: 'recipient', headerName: 'Recipient', editable: true, flex: 1, minWidth: 120 },
        {
            field: 'category',
            headerName: 'Category',
            editable: true,
            flex: 0.9,
            minWidth: 120,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: { values: CATEGORIES },
        },
        {
            field: 'amount',
            headerName: 'Amount',
            editable: true,
            type: 'numericColumn',
            flex: 0.9,
            minWidth: 130,
            valueFormatter: (p) => (p.value == null ? '' : Number(p.value).toLocaleString()),
        },
        {
            field: 'expense_date',
            headerName: 'Date',
            editable: true,
            flex: 0.9,
            minWidth: 120,
        },
        { field: 'time', headerName: 'Time', editable: true, flex: 0.7, minWidth: 100 },
        { field: 'reference_number', headerName: 'Reference', editable: true, flex: 1, minWidth: 120 },
        {
            field: 'payment_method',
            headerName: 'Payment Method',
            editable: true,
            flex: 1.1,
            minWidth: 140,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: { values: PAYMENT_METHOD_VALUES },
            valueFormatter: (p) => PAYMENT_LABELS[p.value] || p.value || '',
            valueParser: (p) => p.newValue,
        },
        { field: 'purpose', headerName: 'Purpose', editable: true, flex: 1.2, minWidth: 140 },
        { field: 'description', headerName: 'Description', editable: true, flex: 1.2, minWidth: 140 },
        {
            headerName: 'Receipt',
            width: 80,
            pinned: 'right',
            cellRenderer: (p) => {
                const d = p.data;
                if (d?.receipt_url) {
                    return '<span title="Receipt attached" style="color:#22c55e;cursor:pointer"><i class="fas fa-file-image"></i></span>';
                }
                return '<span title="Attach receipt" style="color:#6b7280;cursor:pointer"><i class="fas fa-paperclip"></i></span>';
            },
            onCellClicked: (p) => {
                setReceiptVerifyRow(p.data);
                setReceiptData(null);
            },
            resizable: false,
            sortable: false,
            filter: false,
        },
    ]), []);

    const defaultColDef = useMemo(() => ({
        sortable: true,
        filter: true,
        resizable: true,
        floatingFilter: true,
    }), []);

    const onCellValueChanged = useCallback((params) => {
        if (params.newValue === params.oldValue) return;
        setRowData((prev) => {
            const next = [...prev];
            next[params.rowIndex] = { ...next[params.rowIndex], [params.colDef.field]: params.newValue };
            return next;
        });
    }, []);

    const onSelectionChanged = useCallback(() => {
        if (!gridRef.current) return;
        const selected = gridRef.current.api.getSelectedRows();
        setSelectedRows(selected);
    }, []);

    const applyProject = useCallback((rows) => {
        if (!defaultProjectId) return rows;
        return rows.map(r => r.project_id ? r : { ...r, project_id: Number(defaultProjectId) });
    }, [defaultProjectId]);

    const handlePaste = useCallback((e) => {
        const text = e.clipboardData?.getData('text') || '';
        if (!text || text.trim().length < 5) return;
        e.preventDefault();
        const { rows, unmappedHeaders } = parseTabDelimited(text);
        if (rows.length > 0) {
            const withProject = applyProject(rows);
            if (unmappedHeaders.length > 0) {
                setPastePreview({ rows: withProject, unmappedHeaders });
            } else {
                setRowData(prev => [...prev, ...withProject]);
                toast.success(`Pasted ${rows.length} rows from clipboard`);
            }
        } else {
            const headerLine = text.replace(/\r\n/g, '\n').replace(/\r/g, '').split('\n')[0] || '';
            toast.error(`No rows parsed. Headers: "${headerLine.substring(0, 120)}"`, { duration: 8000 });
        }
    }, [applyProject]);

    useEffect(() => {
        const container = gridContainerRef.current;
        if (!container) return;
        container.addEventListener('paste', handlePaste);
        return () => container.removeEventListener('paste', handlePaste);
    }, [handlePaste]);

    const handlePasteClick = useCallback(async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (!text || text.trim().length < 5) {
                toast.error('No spreadsheet data found in clipboard');
                return;
            }
            const { rows, unmappedHeaders } = parseTabDelimited(text);
            if (rows.length > 0) {
                const withProject = applyProject(rows);
                if (unmappedHeaders.length > 0) {
                    setPastePreview({ rows: withProject, unmappedHeaders });
                } else {
                    setRowData(prev => [...prev, ...withProject]);
                    toast.success(`Pasted ${rows.length} rows from clipboard`);
                }
            } else {
                const preview = text.split('\n')[0]?.substring(0, 120) || '';
                toast.error(`No rows parsed. Headers detected: "${preview}"`, { duration: 6000 });
            }
        } catch {
            toast.error('Could not read clipboard — try Ctrl+V instead');
        }
    }, [applyProject]);

    const confirmPaste = useCallback(() => {
        if (pastePreview) {
            setRowData(prev => [...prev, ...pastePreview.rows]);
            toast.success(`Imported ${pastePreview.rows.length} rows`);
            setPastePreview(null);
        }
    }, [pastePreview]);

    const handleFileImport = useCallback(async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImporting(true);
        try {
            const { rows, unmappedHeaders } = await parseSpreadsheet(file);
            if (rows.length === 0) {
                toast.error('No valid rows found in file');
                return;
            }
            const withProject = applyProject(rows);
            if (unmappedHeaders.length > 0) {
                setPastePreview({ rows: withProject, unmappedHeaders });
            } else {
                setRowData(prev => [...prev, ...withProject]);
                toast.success(`Imported ${rows.length} rows from ${file.name}`);
            }
        } catch {
            toast.error('Failed to parse file');
        } finally {
            setImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }, [applyProject]);

    const handleExportXLSX = useCallback(() => {
        if (!gridRef.current) return;
        const data = [];
        gridRef.current.api.forEachNodeAfterFilterAndSort((node) => {
            if (node.data) {
                const { _rowId, status, ...clean } = node.data;
                data.push(clean);
            }
        });
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Expenses');
        XLSX.writeFile(wb, `expenses_${new Date().toISOString().slice(0, 10)}.xlsx`);
        toast.success(`Exported ${data.length} rows to XLSX`);
    }, []);

    const handleDeleteSelected = useCallback(() => {
        if (selectedRows.length === 0) return;
        if (!confirm(`Delete ${selectedRows.length} selected row(s)?`)) return;
        const ids = new Set(selectedRows.map(r => r._rowId));
        setRowData(prev => prev.filter(r => !ids.has(r._rowId)));
        setSelectedRows([]);
        toast.success(`Deleted ${selectedRows.length} rows`);
    }, [selectedRows]);

    const handleBulkCategory = useCallback((category) => {
        if (selectedRows.length === 0) return;
        const ids = new Set(selectedRows.map(r => r._rowId));
        setRowData(prev => prev.map(r => ids.has(r._rowId) ? { ...r, category } : r));
        toast.success(`Set category to "${category}" for ${selectedRows.length} rows`);
    }, [selectedRows]);

    const handleBulkProject = useCallback((projectId) => {
        if (selectedRows.length === 0) return;
        const ids = new Set(selectedRows.map(r => r._rowId));
        setRowData(prev => prev.map(r => ids.has(r._rowId) ? { ...r, project_id: projectId || null } : r));
        toast.success(`Updated project for ${selectedRows.length} rows`);
    }, [selectedRows]);

    const handleReceiptAnalyze = useCallback(async (file, row) => {
        setReceiptAnalyzing(true);
        try {
            const formData = new FormData();
            formData.append('receipt', file);
            const res = await fetch('/receipts/analyze', {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': decodeURIComponent(
                        document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] || ''
                    ),
                },
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                setReceiptData({ extracted: data.extracted, raw: data.text, tempPath: data.temp_path });
            } else {
                toast.error('OCR failed');
            }
        } catch (err) {
            toast.error('Failed to analyze receipt: ' + err.message);
        } finally {
            setReceiptAnalyzing(false);
        }
    }, []);

    const handleReceiptApply = useCallback((rowData, extracted) => {
        setRowData(prev => prev.map(r => {
            if (r._rowId !== rowData._rowId) return r;
            return {
                ...r,
                title: extracted.title || r.title,
                amount: extracted.amount || r.amount,
                recipient: extracted.recipient || r.recipient,
                expense_date: extracted.date || r.expense_date,
                time: extracted.time || r.time,
                reference_number: extracted.reference_number || r.reference_number,
                payment_method: extracted.payment_method || r.payment_method,
            };
        }));
        setReceiptVerifyRow(null);
        setReceiptData(null);
        toast.success('Receipt data applied to row');
    }, []);

    return (
        <div className="space-y-3">
            {/* Save Status Bar */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-xs">
                        {saveStatus === 'saving' && (
                            <><i className="fas fa-spinner fa-spin text-yellow-400"></i><span className="text-yellow-400">Saving...</span></>
                        )}
                        {saveStatus === 'saved' && !hasChanges && (
                            <><i className="fas fa-check-circle text-green-400"></i><span className="text-green-400">All saved</span></>
                        )}
                        {hasChanges && (
                            <><i className="fas fa-clock text-yellow-400"></i><span className="text-yellow-400">{unsavedCount} unsaved row(s)</span></>
                        )}
                        {saveStatus === 'error' && (
                            <><i className="fas fa-exclamation-circle text-red-400"></i><span className="text-red-400">Save failed</span></>
                        )}
                    </div>
                    <span className="text-xs text-gray-500">
                        {rowData.length} row(s) — Total: KES {totalAmount.toLocaleString()}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {hasChanges && (
                        <button
                            onClick={handleBatchSave}
                            className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#8B0000] text-white hover:bg-[#DC143C] transition-all"
                        >
                            <i className="fas fa-save mr-2"></i>
                            Save to Database
                        </button>
                    )}
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={handlePasteClick}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-all"
                    >
                        <i className="fas fa-paste mr-1"></i>Paste
                    </button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.xlsx,.xls,.tsv,.txt"
                        onChange={handleFileImport}
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={importing}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-all disabled:opacity-50"
                    >
                        <i className="fas fa-file-import mr-1"></i>{importing ? 'Importing...' : 'Import'}
                    </button>

                    <button
                        onClick={handleExportXLSX}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-all"
                    >
                        <i className="fas fa-file-excel mr-1"></i>Export
                    </button>

                    <div className="w-px h-5 bg-white/10"></div>

                    {selectedRows.length > 0 && (
                        <>
                            <span className="text-xs text-gray-400">{selectedRows.length} selected</span>

                            <select
                                onChange={(e) => { if (e.target.value) handleBulkCategory(e.target.value); e.target.value = ''; }}
                                className="px-2 py-1 rounded-lg text-xs bg-white/5 border border-white/10 text-gray-300"
                                defaultValue=""
                            >
                                <option value="" disabled>Set Category</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>

                            {projects.length > 0 && (
                                <select
                                    onChange={(e) => handleBulkProject(e.target.value || null)}
                                    className="px-2 py-1 rounded-lg text-xs bg-white/5 border border-white/10 text-gray-300"
                                    defaultValue=""
                                >
                                    <option value="">Set Project</option>
                                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            )}

                            <button
                                onClick={handleDeleteSelected}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-900/30 border border-red-800/50 text-red-300 hover:bg-red-900/50 transition-all"
                            >
                                <i className="fas fa-trash mr-1"></i>Delete
                            </button>
                        </>
                    )}

                    <button
                        onClick={() => setShowAnalysis(!showAnalysis)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${showAnalysis ? 'bg-[#8B0000]/20 border-[#8B0000]/50 text-[#DC143C]' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'}`}
                    >
                        <i className="fas fa-chart-bar mr-1"></i>Analysis
                    </button>
                </div>

                <div className="text-xs text-gray-500">
                    <i className="fas fa-paste mr-1"></i>
                    Paste from spreadsheet — columns auto-match
                </div>
            </div>

            {/* Analysis Panel */}
            {showAnalysis && (
                <div className="bg-gray-900/50 border border-white/10 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Summary</h4>
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between"><span className="text-gray-400">Total Rows</span><span className="text-white font-mono">{rowData.length}</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">Saved</span><span className="text-green-400 font-mono">{rowData.filter(r => r.id).length}</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">Unsaved</span><span className="text-yellow-400 font-mono">{unsavedCount}</span></div>
                            <div className="flex justify-between border-t border-white/10 pt-1"><span className="text-gray-300 font-semibold">Total Amount</span><span className="text-white font-mono font-bold">KES {totalAmount.toLocaleString()}</span></div>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">By Category</h4>
                        <div className="space-y-1 text-xs max-h-40 overflow-y-auto">
                            {categoryBreakdown.map(([cat, data]) => (
                                <div key={cat} className="flex justify-between">
                                    <span className="text-gray-300">{cat} <span className="text-gray-500">({data.count})</span></span>
                                    <span className="text-white font-mono">{data.total.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">By Payment Method</h4>
                        <div className="space-y-1 text-xs max-h-40 overflow-y-auto">
                            {paymentBreakdown.map(([method, data]) => (
                                <div key={method} className="flex justify-between">
                                    <span className="text-gray-300">{method} <span className="text-gray-500">({data.count})</span></span>
                                    <span className="text-white font-mono">{data.total.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Grid */}
            <div
                ref={gridContainerRef}
                tabIndex={0}
                className="w-full overflow-hidden rounded-xl border border-white/10 focus:outline-none focus:ring-1 focus:ring-red-800/50"
                style={{ height: 550, minHeight: 400 }}
            >
                <AgGridReact
                    ref={gridRef}
                    rowData={rowData}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    theme={themeQuartz.withPart(colorSchemeDark)}
                    animateRows
                    rowSelection={{ mode: 'multiRow', checkboxes: true, headerCheckbox: true }}
                    onSelectionChanged={onSelectionChanged}
                    onCellValueChanged={onCellValueChanged}
                    stopEditingWhenCellsLoseFocus
                    getRowId={(params) => {
                        const d = params.data;
                        if (d?.id) return String(d.id);
                        return d?._rowId || `row_${Math.random().toString(36).slice(2)}`;
                    }}
                />
            </div>

            {/* Inline dark theme overrides */}
            <style dangerouslySetInnerHTML={{ __html: `
                .ag-root-wrapper { background: #111 !important; }
                .ag-cell { color: #fff; border-color: #333 !important; }
                .ag-header-cell { border-color: #333 !important; }
                .ag-floating-filter input { color: #fff; background: #1a1a1a; border-color: #333; }
                .ag-row-hover { background-color: rgba(139,0,0,0.15) !important; }
                .ag-selected-row { background-color: rgba(139,0,0,0.25) !important; }
                .ag-selection-checkbox { border-color: #555 !important; }
            ` }} />

            {/* Paste Preview Modal */}
            {pastePreview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setPastePreview(null)}>
                    <div className="bg-gray-900 border border-white/10 rounded-2xl max-w-3xl w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-4 border-b border-white/10">
                            <h3 className="text-lg font-bold text-white">
                                <i className="fas fa-clipboard-list mr-2 text-yellow-400"></i>
                                Paste Preview — {pastePreview.rows.length} rows
                            </h3>
                            <button onClick={() => setPastePreview(null)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="p-4">
                            {pastePreview.unmappedHeaders.length > 0 && (
                                <div className="mb-3 p-3 bg-yellow-900/20 border border-yellow-800/30 rounded-lg">
                                    <p className="text-yellow-300 text-xs font-semibold mb-1">
                                        <i className="fas fa-exclamation-triangle mr-1"></i>
                                        {pastePreview.unmappedHeaders.length} unrecognized column(s):
                                    </p>
                                    <p className="text-yellow-200/70 text-xs">
                                        {pastePreview.unmappedHeaders.join(', ')}
                                    </p>
                                    <p className="text-gray-400 text-xs mt-1">
                                        These columns were skipped. Data in known columns was mapped correctly.
                                    </p>
                                </div>
                            )}
                            <div className="max-h-60 overflow-auto rounded-lg border border-white/10">
                                <table className="w-full text-xs">
                                    <thead className="bg-black/30 text-gray-400">
                                        <tr>
                                            <th className="px-3 py-2 text-left">Title</th>
                                            <th className="px-3 py-2 text-right">Amount</th>
                                            <th className="px-3 py-2 text-left">Date</th>
                                            <th className="px-3 py-2 text-left">Category</th>
                                            <th className="px-3 py-2 text-left">Payment</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {pastePreview.rows.slice(0, 20).map((r, i) => (
                                            <tr key={i} className="text-gray-300">
                                                <td className="px-3 py-1.5">{r.title || <span className="text-red-400">empty</span>}</td>
                                                <td className="px-3 py-1.5 text-right font-mono">{r.amount ? Number(r.amount).toLocaleString() : <span className="text-red-400">0</span>}</td>
                                                <td className="px-3 py-1.5">{r.expense_date}</td>
                                                <td className="px-3 py-1.5">{r.category}</td>
                                                <td className="px-3 py-1.5">{PAYMENT_LABELS[r.payment_method] || r.payment_method}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {pastePreview.rows.length > 20 && (
                                <p className="text-gray-500 text-xs mt-2">...and {pastePreview.rows.length - 20} more rows</p>
                            )}
                        </div>
                        <div className="flex justify-end gap-3 p-4 border-t border-white/10">
                            <button onClick={() => setPastePreview(null)} className="px-4 py-2 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-all">
                                Cancel
                            </button>
                            <button onClick={confirmPaste} className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#8B0000] text-white hover:bg-[#DC143C] transition-all">
                                <i className="fas fa-check mr-2"></i>Import {pastePreview.rows.length} Rows
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Receipt Verify Modal */}
            {receiptVerifyRow && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => { setReceiptVerifyRow(null); setReceiptData(null); }}>
                    <div className="bg-gray-900 border border-white/10 rounded-2xl max-w-2xl w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-4 border-b border-white/10">
                            <h3 className="text-lg font-bold text-white">
                                <i className="fas fa-receipt mr-2 text-[#DC143C]"></i>
                                Receipt — {receiptVerifyRow.title || 'New Expense'}
                            </h3>
                            <button onClick={() => { setReceiptVerifyRow(null); setReceiptData(null); }} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            {!receiptData ? (
                                <div>
                                    <p className="text-gray-400 text-sm mb-3">Upload a receipt to extract data via OCR and compare with the current row.</p>
                                    <input
                                        ref={receiptInputRef}
                                        type="file"
                                        accept="image/*,.pdf"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleReceiptAnalyze(file, receiptVerifyRow);
                                            e.target.value = '';
                                        }}
                                    />
                                    <button
                                        onClick={() => receiptInputRef.current?.click()}
                                        disabled={receiptAnalyzing}
                                        className="px-4 py-3 rounded-xl border-2 border-dashed border-white/20 text-gray-400 hover:border-[#DC143C] hover:text-[#DC143C] transition-all w-full text-center disabled:opacity-50"
                                    >
                                        {receiptAnalyzing ? (
                                            <><i className="fas fa-spinner fa-spin mr-2"></i>Analyzing receipt...</>
                                        ) : (
                                            <><i className="fas fa-cloud-upload-alt mr-2"></i>Click to upload receipt (JPG, PNG, PDF)</>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="p-3 bg-green-900/20 border border-green-800/30 rounded-lg">
                                        <p className="text-green-300 text-xs font-semibold mb-1">
                                            <i className="fas fa-check-circle mr-1"></i>
                                            OCR extracted data — review and apply
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                        {[
                                            ['Title', receiptData.extracted?.title, 'title'],
                                            ['Amount', receiptData.extracted?.amount, 'amount'],
                                            ['Recipient', receiptData.extracted?.recipient, 'recipient'],
                                            ['Date', receiptData.extracted?.date, 'expense_date'],
                                            ['Time', receiptData.extracted?.time, 'time'],
                                            ['Reference', receiptData.extracted?.reference_number, 'reference_number'],
                                            ['Payment', receiptData.extracted?.payment_method, 'payment_method'],
                                        ].map(([label, value, field]) => (
                                            <div key={field} className="bg-white/5 rounded-lg p-2">
                                                <span className="text-gray-500 block">{label}</span>
                                                <span className="text-white">{value || <span className="text-gray-600">—</span>}</span>
                                                {value && receiptVerifyRow[field] && receiptVerifyRow[field] !== String(value) && (
                                                    <span className="block text-yellow-400 text-[10px] mt-0.5">
                                                        Current: {receiptVerifyRow[field]}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-2 bg-white/5 rounded-lg">
                                        <span className="text-gray-500 text-xs block mb-1">Raw OCR Text</span>
                                        <p className="text-gray-300 text-xs max-h-24 overflow-y-auto font-mono whitespace-pre-wrap">{receiptData.raw}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        {receiptData && (
                            <div className="flex justify-end gap-3 p-4 border-t border-white/10">
                                <button onClick={() => setReceiptData(null)} className="px-4 py-2 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-all">
                                    <i className="fas fa-redo mr-2"></i>Re-scan
                                </button>
                                <button onClick={() => handleReceiptApply(receiptVerifyRow, receiptData.extracted)} className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#8B0000] text-white hover:bg-[#DC143C] transition-all">
                                    <i className="fas fa-check mr-2"></i>Apply to Row
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
