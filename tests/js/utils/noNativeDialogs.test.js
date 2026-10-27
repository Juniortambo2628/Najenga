import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = join(__dirname, '../../../resources/js');

function sources(dir) {
    return readdirSync(dir).flatMap((name) => {
        const path = join(dir, name);
        if (statSync(path).isDirectory()) return sources(path);
        return /\.(jsx?|tsx?)$/.test(name) ? [path] : [];
    });
}

// confirm()/prompt()/alert() block the page and ignore the dark theme; use
// confirmAction()/promptAction() from Utils/feedback (its fallback is the only
// allowed caller) and react-hot-toast.
const NATIVE = /(?<![\w.])(?:window\.)?(confirm|prompt|alert)\s*\(/;

describe('native browser dialogs', () => {
    it('are not called anywhere but the feedback fallback', () => {
        const offenders = sources(root)
            .filter((file) => !file.endsWith(join('Utils', 'feedback.js')))
            .flatMap((file) =>
                readFileSync(file, 'utf8')
                    .split('\n')
                    .map((line, i) => [line, i + 1])
                    .filter(([line]) => !line.trim().startsWith('//') && !line.trim().startsWith('*') && NATIVE.test(line))
                    .map(([, n]) => `${relative(root, file)}:${n}`),
            );
        expect(offenders).toEqual([]);
    });
});
