<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Annotation extends Model
{
    use HasFactory;

    protected $fillable = ['annotatable_id', 'annotatable_type', 'user_id', 'x', 'y', 'width', 'height', 'body', 'resolved'];

    protected function casts(): array
    {
        return [
            'resolved' => 'boolean',
        ];
    }

    public function annotatable()
    {
        return $this->morphTo();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
