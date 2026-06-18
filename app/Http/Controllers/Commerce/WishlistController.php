<?php

namespace App\Http\Controllers\Commerce;

use App\Http\Controllers\Controller;
use App\Models\Book;
use Inertia\Inertia;

class WishlistController extends Controller
{
    public function index()
    {
        $items = auth()->user()->wishlists()
            ->with(['book.authors', 'book.category'])
            ->latest()
            ->get();

        return Inertia::render('Wishlist/Index', ['items' => $items]);
    }

    public function toggle(Book $book)
    {
        $user = auth()->user();
        $exists = $user->wishlists()->where('book_id', $book->id)->exists();

        if ($exists) {
            $user->wishlists()->where('book_id', $book->id)->delete();
            return response()->json(['wishlisted' => false]);
        }

        $user->wishlists()->create(['book_id' => $book->id]);
        return response()->json(['wishlisted' => true]);
    }
}
