<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WhatsAppLog extends Model
{
    use HasFactory;

    protected $table = 'whatsapp_logs';

    protected $fillable = [
        'user_id', 'phone_number', 'message', 'direction', 'status',
        'error_message', 'message_id', 'timestamp',
        'filed_type', 'filed_id',
    ];
    public $timestamps = false;

    public function filed(): \Illuminate\Database\Eloquent\Relations\MorphTo
    {
        return $this->morphTo(__FUNCTION__, 'filed_type', 'filed_id');
    }

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
