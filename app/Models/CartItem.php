<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class CartItem extends Model {
    protected $fillable = ['cart_id', 'book_id', 'book_type', 'quantity', 'price_snapshot'];
    protected $casts = ['price_snapshot' => 'decimal:2'];
    public function cart(): BelongsTo { return $this->belongsTo(Cart::class); }
    public function book(): BelongsTo { return $this->belongsTo(Book::class); }
    public function getSubtotalAttribute(): float { return $this->price_snapshot * $this->quantity; }
}
