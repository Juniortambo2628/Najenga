// Self-hosted OCR worker using tesseract.js (Apache-2.0).
// Called by Laravel via Symfony Process: `node ocr-worker.mjs <file-path>`
// Outputs JSON to stdout: { text, confidence, success, error }

import { createWorker } from 'tesseract.js';

const filePath = process.argv[2];

if (!filePath) {
    console.log(JSON.stringify({ success: false, error: 'No file path provided' }));
    process.exit(1);
}

async function run() {
    let worker;
    try {
        // eng+osd handles English plus orientation/script detection
        worker = await createWorker(['eng'], 1, {
            // Cache language data globally so subsequent runs are fast
            cachePath: process.env.TESSERACT_CACHE_DIR || undefined,
            logger: () => {}, // silence per-line progress
        });

        const { data } = await worker.recognize(filePath);

        console.log(JSON.stringify({
            success: true,
            text: data.text || '',
            confidence: data.confidence || 0,
        }));
    } catch (err) {
        console.log(JSON.stringify({
            success: false,
            error: err?.message || String(err),
        }));
        process.exitCode = 1;
    } finally {
        if (worker) await worker.terminate().catch(() => {});
    }
}

run();
