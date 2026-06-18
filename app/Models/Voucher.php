<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
class Voucher extends Model {
    protected $fillable = ['code', 'type', 'value', 'min_order', 'max_discount', 'max_uses', 'used_count', 'applies_to', 'applies_to_id', 'starts_at', 'expires_at', 'is_active'];
    protected $casts = ['value' => 'decimal:2', 'min_order' => 'decimal:2', 'max_discount' => 'decimal:2', 'starts_at' => 'datetime', 'expires_at' => 'datetime', 'is_active' => 'boolean'];
    public function usages(): HasMany { return $this->hasMany(VoucherUsage::class); }
    public function isValid(): bool { return $this->is_active && now()->between($this->starts_at, $this->expires_at) && ($this->max_uses === null || $this->used_count < $this->max_uses); }
}
