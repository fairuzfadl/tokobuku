<?php

namespace App\Observers;

use App\Models\Book;
use Illuminate\Support\Facades\Cache;

class BookObserver
{
    public function saved(Book $book): void
    {
        Cache::forget("book:{$book->slug}");
    }

    public function deleted(Book $book): void
    {
        Cache::forget("book:{$book->slug}");
    }
}
