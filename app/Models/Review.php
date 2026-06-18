<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class Review extends Model {
    protected $fillable = ['book_id', 'user_id', 'order_id', 'rating', 'title', 'body', 'image', 'is_approved', 'approved_at'];
    protected $casts = ['is_approved' => 'boolean', 'approved_at' => 'datetime'];
    public function book(): BelongsTo { return $this->belongsTo(Book::class); }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function order(): BelongsTo { return $this->belongsTo(Order::class); }
}
