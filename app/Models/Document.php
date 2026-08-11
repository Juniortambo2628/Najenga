<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Laravel\Scout\Searchable;
use Spatie\Image\Enums\Fit;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Document extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia, Searchable;

    protected $fillable = [
        'project_id',
        'user_id',
        'folder_id',
        'filename',
        'original_name',
        'file_path',
        'file_size',
        'mime_type',
        'title',
        'description',
        'category',
        'document_date',
    ];

    protected function casts(): array
    {
        return [
            'document_date' => 'date',
        ];
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('files')
            ->acceptsFile(fn ($file) => in_array(strtolower($file->mimeType), [
                'application/pdf',
                'image/jpeg', 'image/png', 'image/webp', 'image/gif',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'text/plain',
            ]));
    }

    /**
     * Image conversions for thumbnail grids + previews.
     * PDF page-1 thumbnail is registered but no-ops gracefully if
     * Ghostscript isn't installed.
     */
    public function registerMediaConversions(?Media $media = null): void
    {
        // Image conversions — applied to image/* MIME types
        $this->addMediaConversion('thumb')
            ->width(300)->height(300)->fit(Fit::Crop, 300, 300)
            ->sharpen(10)
            ->performOnCollections('files')
            ->nonQueued();

        $this->addMediaConversion('preview')
            ->width(1200)->height(1200)->fit(Fit::Contain, 1200, 1200)
            ->performOnCollections('files')
            ->nonQueued();

        $this->addMediaConversion('responsive')
            ->width(1920)
            ->performOnCollections('files')
            ->nonQueued();

        // PDF first-page thumbnail — picked up automatically by
        // \App\Conversions\PdfFirstPageThumbnail registered in
        // config/media-library.php (requires Ghostscript or Imagick)
        $this->addMediaConversion('pdf-thumb')
            ->performOnCollections('files')
            ->nonQueued();
    }

    public function getFileUrlAttribute(): ?string
    {
        return $this->getFirstMediaUrl('files');
    }

    /**
     * Returns a thumbnail URL that works for both image and PDF files.
     * Falls back to the original file URL if no thumbnail was generated.
     */
    public function getThumbUrlAttribute(): ?string
    {
        $media = $this->getFirstMedia('files');
        if (!$media) return null;
        return $media->mime_type === 'application/pdf'
            ? ($media->getUrl('pdf-thumb') ?: $media->getUrl())
            : ($media->getUrl('thumb') ?: $media->getUrl());
    }

    public function folder(): BelongsTo
    {
        return $this->belongsTo(Folder::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function comments(): \Illuminate\Database\Eloquent\Relations\MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable');
    }

    public function annotations(): \Illuminate\Database\Eloquent\Relations\MorphMany
    {
        return $this->morphMany(Annotation::class, 'annotatable')->with('user');
    }

    /**
     * Shape of the MeiliSearch document. Indexed fields are searched,
     * filterable fields support faceted filters.
     */
    public function toSearchableArray(): array
    {
        return [
            'id'            => (int) $this->id,
            'title'         => (string) $this->title,
            'description'   => (string) ($this->description ?? ''),
            'original_name' => (string) ($this->original_name ?? $this->filename ?? ''),
            'category'      => (string) ($this->category ?? ''),
            'mime_type'     => (string) ($this->mime_type ?? ''),
            'project_id'    => (int) ($this->project_id ?? 0),
            'user_id'       => (int) ($this->user_id ?? 0),
            'folder_id'     => (int) ($this->folder_id ?? 0),
            'document_date' => optional($this->document_date)->toDateString() ?? '',
            'created_at'    => optional($this->created_at)->timestamp ?? 0,
            'type'          => 'document',
        ];
    }

    /**
     * Filterable / sortable MeiliSearch attributes.
     */
    public function searchableAs(): string
    {
        return 'documents';
    }
}
