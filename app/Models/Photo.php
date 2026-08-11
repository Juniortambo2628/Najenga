<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Laravel\Scout\Searchable;
use Spatie\Image\Enums\Fit;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Photo extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia, Searchable;

    protected $fillable = [
        'project_id',
        'user_id',
        'filename',
        'original_name',
        'file_path',
        'file_size',
        'mime_type',
        'title',
        'location',
        'description',
        'category',
        'photo_date',
        'is_featured',
    ];

    protected function casts(): array
    {
        return [
            'photo_date' => 'date',
            'is_featured' => 'boolean',
        ];
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('photos')
            ->acceptsFile(fn ($file) => in_array(strtolower($file->mimeType), [
                'image/jpeg', 'image/png', 'image/webp', 'image/gif',
            ]));
    }

    /**
     * Image conversions for fast grid rendering + preview.
     */
    public function registerMediaConversions(?\Spatie\MediaLibrary\MediaCollections\Models\Media $media = null): void
    {
        // 300x300 square crop for grid thumbnails
        $this->addMediaConversion('thumb')
            ->width(300)->height(300)->fit(Fit::Crop, 300, 300)
            ->sharpen(10)
            ->performOnCollections('photos')
            ->nonQueued();

        // 1200px max-dim preview for modal viewer
        $this->addMediaConversion('preview')
            ->width(1200)->height(1200)->fit(Fit::Contain, 1200, 1200)
            ->performOnCollections('photos')
            ->nonQueued();

        // Multiple widths for responsive srcset
        $this->addMediaConversion('responsive')
            ->width(1920)
            ->performOnCollections('photos')
            ->nonQueued();
    }

    public function getPhotoUrlAttribute(): ?string
    {
        return $this->getFirstMediaUrl('photos');
    }

    public function getThumbUrlAttribute(): ?string
    {
        $media = $this->getFirstMedia('photos');
        return $media ? ($media->getUrl('thumb') ?: $media->getUrl()) : null;
    }

    public function getPreviewUrlAttribute(): ?string
    {
        $media = $this->getFirstMedia('photos');
        return $media ? ($media->getUrl('preview') ?: $media->getUrl()) : null;
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function annotations(): \Illuminate\Database\Eloquent\Relations\MorphMany
    {
        return $this->morphMany(Annotation::class, 'annotatable')->with('user');
    }

    public function comments(): \Illuminate\Database\Eloquent\Relations\MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable');
    }

    public function toSearchableArray(): array
    {
        return [
            'id'          => (int) $this->id,
            'title'       => (string) $this->title,
            'description' => (string) ($this->description ?? ''),
            'location'    => (string) ($this->location ?? ''),
            'category'    => (string) ($this->category ?? ''),
            'mime_type'   => (string) ($this->mime_type ?? ''),
            'project_id'  => (int) ($this->project_id ?? 0),
            'user_id'     => (int) ($this->user_id ?? 0),
            'is_featured' => (bool) $this->is_featured,
            'photo_date'  => optional($this->photo_date)->toDateString() ?? '',
            'created_at'  => optional($this->created_at)->timestamp ?? 0,
            'type'        => 'photo',
        ];
    }

    public function searchableAs(): string
    {
        return 'photos';
    }
}
