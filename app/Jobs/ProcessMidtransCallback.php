<?php

namespace App\Jobs;

use App\Events\OrderCancelled;
use App\Events\OrderPaid;
use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class ProcessMidtransCallback implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 5;
    public int $backoff = 30;

    public function __construct(private array $payload) {}

    public function handle(): void
    {
        DB::transaction(function () {
            $payment = Payment::where('midtrans_order_id', $this->payload['order_id'])
                ->lockForUpdate()
                ->firstOrFail();

            // Idempotency: skip jika sudah terminal
            if (in_array($payment->payment_status, ['settlement', 'capture'])) return;

            $status = $this->payload['transaction_status'];

            $payment->update([
                'payment_status'    => $status,
                'payment_type'      => $this->payload['payment_type'] ?? null,
                'transaction_id'    => $this->payload['transaction_id'] ?? null,
                'midtrans_response' => $this->payload,
                'va_number'         => $this->payload['va_numbers'][0]['va_number'] ?? null,
                'paid_at'           => in_array($status, ['settlement', 'capture']) ? now() : null,
            ]);

            $order = $payment->order;

            if (in_array($status, ['capture', 'settlement'])) {
                $order->update(['status' => 'paid']);
                event(new OrderPaid($order));
            } elseif (in_array($status, ['cancel', 'deny', 'expire'])) {
                $order->update(['status' => 'cancelled', 'cancelled_at' => now()]);
                event(new OrderCancelled($order));
            }
        });
    }
}
