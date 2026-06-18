<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class OrderItem extends Model {
    public $timestamps = false;
    protected $fillable = ['order_id', 'book_id', 'book_type', 'quantity', 'unit_price', 'subtotal', 'book_title', 'book_cover'];
    protected $casts = ['unit_price' => 'decimal:2', 'subtotal' => 'decimal:2', 'created_at' => 'datetime'];
    public function order(): BelongsTo { return $this->belongsTo(Order::class); }
    public function book(): BelongsTo { return $this->belongsTo(Book::class); }
}
