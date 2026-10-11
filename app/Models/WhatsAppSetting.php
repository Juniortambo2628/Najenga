<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WhatsAppSetting extends Model
{
    protected $table = 'whatsapp_settings';

    protected $fillable = [
        'expense_notifications',
        'project_notifications',
        'document_notifications',
    ];

    /**
     * Get the single settings row, creating it with defaults on first use.
     */
    public static function current(): static
    {
        return static::query()->first() ?? static::forceCreate([
            'id' => 1,
            'expense_notifications' => true,
            'project_notifications' => true,
            'document_notifications' => true,
        ]);
    }

    protected function casts(): array
    {
        return [
            'expense_notifications' => 'boolean',
            'project_notifications' => 'boolean',
            'document_notifications' => 'boolean',
        ];
    }
}
