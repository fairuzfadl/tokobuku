<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;
class Author extends Model {
    protected $fillable = ['name', 'slug', 'bio', 'photo', 'nationality'];
    protected static function boot(): void { parent::boot(); static::creating(fn($a) => $a->slug = $a->slug ?? Str::slug($a->name)); }
    public function books(): BelongsToMany { return $this->belongsToMany(Book::class, 'book_author')->withPivot('role'); }
}
