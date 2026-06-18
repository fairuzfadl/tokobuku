<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;
class Publisher extends Model {
    protected $fillable = ['name', 'slug', 'description', 'logo', 'website', 'city'];
    protected static function boot(): void { parent::boot(); static::creating(fn($p) => $p->slug = $p->slug ?? Str::slug($p->name)); }
    public function books(): HasMany { return $this->hasMany(Book::class); }
}
