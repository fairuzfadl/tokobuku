<?php

namespace App\Listeners;

use App\Events\OrderShipped;
use App\Mail\OrderShippedMail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Mail;

class SendOrderShippedEmail implements ShouldQueue
{
    public string $queue = 'default';

    public function handle(OrderShipped $event): void
    {
        Mail::to($event->order->user->email)
            ->send(new OrderShippedMail($event->order));
    }
}
