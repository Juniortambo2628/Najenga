<?php

return [
    /*
    | Timezone the site photos were taken in. Filenames such as
    | "WhatsApp Image 2025-10-07 at 20.21.35" are in this local time, and
    | taken_at is stored as that wall-clock time.
    */
    'local_timezone' => env('PHOTOS_LOCAL_TIMEZONE', 'Africa/Nairobi'),

    // Files sent per request by the bulk uploader (also capped by PHP's max_file_uploads).
    'upload_batch_size' => (int) env('PHOTOS_UPLOAD_BATCH_SIZE', 10),
];
