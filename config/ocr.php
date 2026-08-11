<?php

return [
    'api_key' => env('OCR_SPACE_KEY', 'helloworld'),
    'api_url' => env('OCR_SPACE_URL', 'https://api.ocr.space/parse/image'),
    'engine' => env('OCR_ENGINE', '2'),
];
