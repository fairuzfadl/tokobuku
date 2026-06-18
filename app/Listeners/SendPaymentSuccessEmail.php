<?php

namespace App\Listeners;

use App\Events\OrderPaid;
use App\Mail\OrderPaidMail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Mail;

class SendPaymentSuccessEmail implements ShouldQueue
{
    public string $queue = 'default';

    public function handle(OrderPaid $event): void
    {
        Mail::to($event->order->user->email)
            ->send(new OrderPaidMail($event->order));
    }
}
