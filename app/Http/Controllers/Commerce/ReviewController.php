<?php

namespace App\Http\Controllers\Commerce;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Review;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ReviewController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'book_id'  => 'required|exists:books,id',
            'order_id' => 'required|exists:orders,id',
            'rating'   => 'required|integer|between:1,5',
            'title'    => 'nullable|string|max:200',
            'body'     => 'nullable|string|max:2000',
            'image'    => 'nullable|image|max:2048',
        ]);

        $book = Book::findOrFail($request->book_id);
        $user = auth()->user();

        $order = $user->orders()
            ->where('id', $request->order_id)
            ->where('status', 'completed')
            ->whereHas('items', fn($q) => $q->where('book_id', $book->id))
            ->firstOrFail();

        if ($book->reviews()->where('user_id', $user->id)->where('order_id', $order->id)->exists()) {
            return response()->json(['message' => 'Anda sudah memberikan ulasan untuk buku ini.'], 422);
        }

        $imagePath = null;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('reviews', 'public');
            $imagePath = Storage::disk('public')->url($path);
        }

        $autoApprove = (bool) Setting::get('review_auto_approve', 0);

        $book->reviews()->create([
            'user_id'     => $user->id,
            'order_id'    => $order->id,
            'rating'      => $request->rating,
            'title'       => $request->title,
            'body'        => $request->body,
            'image'       => $imagePath,
            'is_approved' => $autoApprove,
            'approved_at' => $autoApprove ? now() : null,
        ]);

        if ($autoApprove) {
            $this->syncBookRating($book->id);
        }

        $message = $autoApprove
            ? 'Ulasan berhasil ditambahkan.'
            : 'Ulasan berhasil dikirim dan menunggu moderasi.';

        return response()->json(['message' => $message, 'auto_approved' => $autoApprove]);
    }

    private function syncBookRating(int $bookId): void
    {
        $stats = Review::where('book_id', $bookId)
            ->where('is_approved', true)
            ->selectRaw('AVG(rating) as avg_rating, COUNT(*) as rating_count')
            ->first();

        Book::where('id', $bookId)->update([
            'rating_avg'   => $stats->avg_rating ? round($stats->avg_rating, 2) : 0,
            'rating_count' => $stats->rating_count ?? 0,
        ]);
    }
}
