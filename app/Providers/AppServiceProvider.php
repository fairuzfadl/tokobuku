<?php

namespace App\Providers;

use App\Models\Book;
use App\Models\Review;
use App\Observers\BookObserver;
use App\Observers\ReviewObserver;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Observers
        Book::observe(BookObserver::class);
        Review::observe(ReviewObserver::class);

        // Event → Listener mappings
        Event::listen(
            \App\Events\OrderPlaced::class,
            \App\Listeners\SendOrderConfirmationEmail::class,
        );
        Event::listen(
            \App\Events\OrderPaid::class,
            [\App\Listeners\GenerateOrderInvoice::class, \App\Listeners\SendPaymentSuccessEmail::class],
        );
        Event::listen(
            \App\Events\OrderShipped::class,
            \App\Listeners\SendOrderShippedEmail::class,
        );
        Event::listen(
            \App\Events\OrderCancelled::class,
            \App\Listeners\RestoreBookStock::class,
        );
    }
}
