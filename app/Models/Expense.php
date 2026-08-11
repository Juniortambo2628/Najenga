<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Laravel\Scout\Searchable;
use Spatie\Image\Enums\Fit;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Expense extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia, Searchable;

    protected $fillable = [
        'project_id',
        'user_id',
        'title',
        'description',
        'amount',
        'currency',
        'category',
        'payment_method',
        'recipient',
        'reference_number',
        'purpose',
        'time',
        'receipt_id',
        'expense_date',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'expense_date' => 'date',
        ];
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('receipt')
            ->singleFile()
            ->acceptsFile(fn ($file) => in_array(strtolower($file->mimeType), [
                'image/jpeg', 'image/png', 'image/webp', 'application/pdf',
            ]));
    }

    /**
     * Receipt thumbnail conversion (mostly for grid views, audit dashboards).
     * PDF receipts get a page-1 thumbnail when Ghostscript is installed.
     */
    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->width(300)->height(400)->fit(Fit::Contain, 300, 400)
            ->background('ffffff')
            ->performOnCollections('receipt')
            ->nonQueued();

        $this->addMediaConversion('preview')
            ->width(1200)->height(1600)->fit(Fit::Contain, 1200, 1600)
            ->performOnCollections('receipt')
            ->nonQueued();

        // PDF receipts: first-page thumbnail (requires Ghostscript or Imagick)
        $this->addMediaConversion('pdf-thumb')
            ->performOnCollections('receipt')
            ->nonQueued();
    }

    public function getReceiptUrlAttribute(): ?string
    {
        return $this->getFirstMediaUrl('receipt');
    }

    public function getReceiptThumbUrlAttribute(): ?string
    {
        $media = $this->getFirstMedia('receipt');
        if (!$media) return null;
        return $media->mime_type === 'application/pdf'
            ? ($media->getUrl('pdf-thumb') ?: $media->getUrl())
            : ($media->getUrl('thumb') ?: $media->getUrl());
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function receipt(): HasOne
    {
        return $this->hasOne(Receipt::class);
    }

    public function toSearchableArray(): array
    {
        return [
            'id'               => (int) $this->id,
            'title'            => (string) $this->title,
            'description'      => (string) ($this->description ?? ''),
            'amount'           => (float) $this->amount,
            'recipient'        => (string) ($this->recipient ?? ''),
            'reference_number' => (string) ($this->reference_number ?? ''),
            'purpose'          => (string) ($this->purpose ?? ''),
            'category'         => (string) ($this->category ?? ''),
            'payment_method'   => (string) ($this->payment_method ?? ''),
            'project_id'       => (int) ($this->project_id ?? 0),
            'user_id'          => (int) ($this->user_id ?? 0),
            'expense_date'     => optional($this->expense_date)->toDateString() ?? '',
            'time'             => (string) ($this->time ?? ''),
            'created_at'       => optional($this->created_at)->timestamp ?? 0,
            'type'             => 'expense',
        ];
    }

    public function searchableAs(): string
    {
        return 'expenses';
    }
}
