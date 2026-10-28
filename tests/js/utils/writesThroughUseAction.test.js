import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { parse } from '@babel/parser';

const root = join(__dirname, '../../../resources/js');
const WRITE = new Set(['post', 'put', 'patch', 'delete']);

// Places allowed to write directly, and why.
const ALLOWED_FILES = [
    'Hooks/useAction.js', // the helper itself
    'Hooks/useBulkDelete.js', // the per-item bulk delete; confirms and toasts like useAction
    'Hooks/useBatchDownload.js', // POSTs to build a ZIP; a download, not a change
    'Hooks/usePresenceHeartbeat.js', // a silent background heartbeat, no change to show or confirm
    'Pages/Photos/Create.jsx', // batched upload with its own progress and per-batch errors
    'Pages/Auth/', // signed-out pages: login, register, password reset
];
// OCR analysis posts files but saves nothing.
const ALLOWED_URLS = ['/receipts/analyze', '/receipts/analyze-bulk'];

function sources(dir) {
    return readdirSync(dir).flatMap((name) => {
        const path = join(dir, name);
        if (statSync(path).isDirectory()) return sources(path);
        return /\.jsx?$/.test(name) ? [path] : [];
    });
}

/** `router.post(`, `axios.delete(`, `window.axios.patch(` or `visit(` */
function isWrite(node) {
    const callee = node.callee;
    if (callee.type === 'Identifier') return callee.name === 'visit';
    if (callee.type !== 'MemberExpression' || callee.property.type !== 'Identifier' || !WRITE.has(callee.property.name)) return false;
    const obj = callee.object;
    if (obj.type === 'Identifier') return obj.name === 'router' || obj.name === 'axios';
    return obj.type === 'MemberExpression' && obj.property.type === 'Identifier' && obj.property.name === 'axios';
}

function directWrites(code) {
    const ast = parse(code, { sourceType: 'module', plugins: ['jsx'] });
    const found = [];
    const walk = (node, insideAction) => {
        if (!node || typeof node.type !== 'string') return;
        if (node.type === 'CallExpression') {
            if (!insideAction && isWrite(node)) {
                const url = node.arguments[0];
                const literal = url?.type === 'StringLiteral' ? url.value : null;
                if (!ALLOWED_URLS.includes(literal)) found.push(node.loc.start.line);
            }
            if (node.callee.type === 'Identifier' && node.callee.name === 'useAction') {
                node.arguments.forEach((arg) => walk(arg, true));
                walk(node.callee, insideAction);
                return;
            }
        }
        for (const key of Object.keys(node)) {
            if (key === 'loc' || key === 'start' || key === 'end') continue;
            const child = node[key];
            if (Array.isArray(child)) child.forEach((c) => walk(c, insideAction));
            else if (child && typeof child.type === 'string') walk(child, insideAction);
        }
    };
    walk(ast.program, false);
    return found;
}

describe('writes', () => {
    it('go through useAction (or a form helper) on every dashboard page', () => {
        const offenders = sources(root)
            .filter((file) => {
                const rel = relative(root, file).split(sep).join('/');
                return !ALLOWED_FILES.some((allowed) => rel.startsWith(allowed));
            })
            .flatMap((file) => directWrites(readFileSync(file, 'utf8')).map((line) => `${relative(root, file)}:${line}`));
        expect(offenders).toEqual([]);
    });

    it('are recognised in the shapes pages use', () => {
        expect(directWrites("router.delete('/x');")).toEqual([1]);
        expect(directWrites("window.axios.post('/x');")).toEqual([1]);
        expect(directWrites("visit('patch', '/x');")).toEqual([1]);
        expect(directWrites("useAction((id) => axios.delete(`/x/${id}`));")).toEqual([]);
        expect(directWrites("useAction(async () => { await window.axios.post('/o'); return visit('post', '/r'); });")).toEqual([]);
        expect(directWrites("axios.post('/receipts/analyze', data);")).toEqual([]);
        expect(directWrites("form.post('/x'); axios.get('/x'); router.get('/x');")).toEqual([]);
    });
});
