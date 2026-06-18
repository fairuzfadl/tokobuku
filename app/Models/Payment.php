<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class Payment extends Model {
    protected $fillable = ['order_id', 'midtrans_order_id', 'snap_token', 'transaction_id', 'payment_type', 'payment_status', 'gross_amount', 'midtrans_response', 'va_number', 'expired_at', 'paid_at'];
    protected $casts = ['gross_amount' => 'decimal:2', 'midtrans_response' => 'array', 'expired_at' => 'datetime', 'paid_at' => 'datetime'];
    public function order(): BelongsTo { return $this->belongsTo(Order::class); }
    public function isSettled(): bool { return in_array($this->payment_status, ['settlement', 'capture']); }
}
