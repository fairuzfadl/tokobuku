<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
class Order extends Model {
    protected $fillable = ['order_number', 'user_id', 'address_id', 'voucher_id', 'status', 'subtotal', 'shipping_cost', 'discount_amount', 'total', 'shipping_courier', 'shipping_service', 'tracking_number', 'notes', 'invoice_path', 'shipped_at', 'completed_at', 'cancelled_at', 'cancellation_reason'];
    protected $casts = ['subtotal' => 'decimal:2', 'shipping_cost' => 'decimal:2', 'discount_amount' => 'decimal:2', 'total' => 'decimal:2', 'shipped_at' => 'datetime', 'completed_at' => 'datetime', 'cancelled_at' => 'datetime'];
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function address(): BelongsTo { return $this->belongsTo(Address::class); }
    public function voucher(): BelongsTo { return $this->belongsTo(Voucher::class); }
    public function items(): HasMany { return $this->hasMany(OrderItem::class); }
    public function payment(): HasOne { return $this->hasOne(Payment::class); }
    public function reviews(): HasMany { return $this->hasMany(Review::class); }
    public function voucherUsage(): HasOne { return $this->hasOne(VoucherUsage::class); }
    public function isPaid(): bool { return in_array($this->status, ['paid', 'processing', 'shipped', 'completed']); }
}
