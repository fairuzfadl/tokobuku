<?php

namespace App\Services;

use App\Exceptions\VoucherInvalidException;
use App\Models\User;
use App\Models\Voucher;

class VoucherService
{
    public function validate(string $code, User $user, float $cartTotal): Voucher
    {
        $voucher = Voucher::where('code', strtoupper($code))->first();

        if (!$voucher) throw new VoucherInvalidException('Kode voucher tidak ditemukan.');
        if (!$voucher->is_active) throw new VoucherInvalidException('Voucher tidak aktif.');
        if (now()->lt($voucher->starts_at)) throw new VoucherInvalidException('Voucher belum berlaku.');
        if (now()->gt($voucher->expires_at)) throw new VoucherInvalidException('Voucher sudah kadaluarsa.');
        if ($voucher->max_uses && $voucher->used_count >= $voucher->max_uses) {
            throw new VoucherInvalidException('Voucher sudah habis digunakan.');
        }
        if ($cartTotal < $voucher->min_order) {
            throw new VoucherInvalidException('Minimum pembelian Rp ' . number_format($voucher->min_order, 0, ',', '.'));
        }

        $userUsed = $voucher->usages()->where('user_id', $user->id)->exists();
        if ($userUsed) throw new VoucherInvalidException('Anda sudah menggunakan voucher ini.');

        return $voucher;
    }
}
