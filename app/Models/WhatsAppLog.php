<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WhatsAppLog extends Model
{
    use HasFactory;

    // Without this Eloquent derives whats_app_logs (Str::snake of the class
    // name), which no migration has ever created.
    protected $table = 'whatsapp_logs';

    protected $fillable = ['user_id', 'phone_number', 'message', 'direction',
        'status', 'message_id', 'timestamp', 'error_message'];
    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'timestamp' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
