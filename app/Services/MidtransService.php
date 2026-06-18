<?php

namespace App\Services;

use App\Events\OrderPaid;
use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Midtrans\Config;
use Midtrans\Snap;
use Midtrans\Transaction;

class MidtransService
{
    public function __construct()
    {
        Config::$serverKey    = config('midtrans.server_key');
        Config::$isProduction = config('midtrans.is_production');
        Config::$isSanitized  = true;
        Config::$is3ds        = true;
    }

    public function syncOrderStatus(Order $order): Order
    {
        if (in_array($order->status, ['paid', 'shipped', 'completed', 'cancelled', 'refunded'])) {
            return $order;
        }

        try {
            $result   = Transaction::status($order->order_number);
            $txStatus = $result->transaction_status ?? null;

            if (in_array($txStatus, ['capture', 'settlement'])) {
                DB::transaction(function () use ($order, $result, $txStatus) {
                    $order->update(['status' => 'paid']);
                    $order->payment?->update([
                        'payment_status' => $txStatus,
                        'payment_type'   => $result->payment_type ?? null,
                        'transaction_id' => $result->transaction_id ?? null,
                        'paid_at'        => now(),
                    ]);
                    event(new OrderPaid($order));
                });
            } elseif (in_array($txStatus, ['cancel', 'deny', 'expire'])) {
                $order->update(['status' => 'cancelled', 'cancelled_at' => now()]);
                $order->payment?->update(['payment_status' => $txStatus]);
            } elseif ($txStatus === 'pending') {
                $order->payment?->update(['payment_status' => 'pending']);
            }
        } catch (\Exception $e) {
            report($e);
        }

        return $order->fresh();
    }

    public function createSnapToken(Order $order): string
    {
        $order->load(['items', 'user', 'address']);

        $itemDetails = $order->items->map(fn($item) => [
            'id'       => "book-{$item->book_id}",
            'price'    => (int) $item->unit_price,
            'quantity' => $item->quantity,
            'name'     => mb_substr($item->book_title, 0, 50),
        ])->toArray();

        if ($order->shipping_cost > 0) {
            $itemDetails[] = [
                'id' => 'shipping', 'price' => (int) $order->shipping_cost,
                'quantity' => 1, 'name' => 'Ongkos Kirim',
            ];
        }

        if ($order->discount_amount > 0) {
            $itemDetails[] = [
                'id' => 'discount', 'price' => -(int) $order->discount_amount,
                'quantity' => 1, 'name' => 'Diskon Voucher',
            ];
        }

        $params = [
            'transaction_details' => [
                'order_id'     => $order->order_number,
                'gross_amount' => (int) $order->total,
            ],
            'item_details'        => $itemDetails,
            'customer_details'    => [
                'first_name' => $order->user->name,
                'email'      => $order->user->email,
                'phone'      => $order->user->phone ?? '',
                'billing_address' => $order->address ? [
                    'first_name' => $order->address->recipient_name,
                    'phone'      => $order->address->phone,
                    'address'    => $order->address->full_address,
                    'city'       => $order->address->city,
                    'postal_code' => $order->address->postal_code,
                    'country_code' => 'IDN',
                ] : null,
            ],
            'callbacks' => [
                'finish' => route('checkout.success', $order->order_number),
            ],
            'expiry' => [
                'start_time' => now()->format('Y-m-d H:i:s O'),
                'unit'       => 'hours',
                'duration'   => config('midtrans.payment_expiry_hours'),
            ],
        ];

        return Snap::getSnapToken($params);
    }

    public function verifySignature(string $orderId, string $statusCode, string $grossAmount, string $signatureKey): bool
    {
        $expected = hash('sha512', $orderId . $statusCode . $grossAmount . config('midtrans.server_key'));
        return hash_equals($expected, $signatureKey);
    }
}
