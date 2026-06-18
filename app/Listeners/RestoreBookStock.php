<?php

namespace App\Listeners;

use App\Events\OrderCancelled;

class RestoreBookStock
{
    public function handle(OrderCancelled $event): void
    {
        foreach ($event->order->items as $item) {
            if ($item->book_type === 'physical' && $item->book_id) {
                \App\Models\Book::where('id', $item->book_id)
                    ->increment('stock', $item->quantity);
            }
        }
    }
}
