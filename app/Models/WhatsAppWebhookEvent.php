<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WhatsAppWebhookEvent extends Model
{
    use HasFactory;

    // Without this Eloquent derives whats_app_webhook_events, which no
    // migration has ever created.
    protected $table = 'whatsapp_webhook_events';

    protected $fillable = ['payload', 'signature', 'processed', 'error_message'];
    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'timestamp' => 'datetime',
        ];
    }
}
