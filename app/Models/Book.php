<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Book extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'publisher_id', 'category_id', 'title', 'slug', 'isbn', 'synopsis',
        'cover_image', 'book_type', 'language', 'pages', 'weight', 'width',
        'height', 'thickness', 'edition', 'published_at', 'price', 'digital_price',
        'discount_percent', 'discount_until', 'stock', 'digital_file', 'rating_avg',
        'rating_count', 'sold_count', 'is_featured', 'is_active', 'meta_title', 'meta_description',
    ];

    protected $casts = [
        'published_at' => 'date',
        'discount_until' => 'datetime',
        'price' => 'decimal:2',
        'digital_price' => 'decimal:2',
        'rating_avg' => 'decimal:2',
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
    ];

    protected static function boot(): void
    {
        parent::boot();
        static::creating(function (Book $book) {
            if (empty($book->slug)) {
                $book->slug = Str::slug($book->title);
            }
        });
    }

    public function getFinalPriceAttribute(): float
    {
        if ($this->discount_percent > 0 && ($this->discount_until === null || $this->discount_until->isFuture())) {
            return $this->price * (1 - $this->discount_percent / 100);
        }
        return $this->price;
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function publisher(): BelongsTo
    {
        return $this->belongsTo(Publisher::class);
    }

    public function authors(): BelongsToMany
    {
        return $this->belongsToMany(Author::class, 'book_author')
            ->withPivot('role');
    }

    public function images(): HasMany
    {
        return $this->hasMany(BookImage::class)->orderBy('sort_order');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class)->where('is_approved', true);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }

    public function scopeSearch(Builder $query, string $term): Builder
    {
        return $query->whereRaw('MATCH(title, synopsis) AGAINST(? IN BOOLEAN MODE)', [$term . '*']);
    }
}
