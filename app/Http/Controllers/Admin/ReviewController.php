<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Inertia\Inertia;

class ReviewController extends Controller
{
    public function index()
    {
        $reviews = Review::with(['user:id,name', 'book:id,title,cover_image'])
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/Reviews/Index', ['reviews' => $reviews]);
    }

    public function approve(Review $review)
    {
        $review->update(['is_approved' => true]);
        $this->syncBookRating($review->book_id);
        return back()->with('success', 'Ulasan disetujui.');
    }

    public function destroy(Review $review)
    {
        $bookId = $review->book_id;
        $review->delete();
        $this->syncBookRating($bookId);
        return back()->with('success', 'Ulasan dihapus.');
    }

    private function syncBookRating(int $bookId): void
    {
        $stats = \App\Models\Review::where('book_id', $bookId)
            ->where('is_approved', true)
            ->selectRaw('AVG(rating) as avg_rating, COUNT(*) as rating_count')
            ->first();

        \App\Models\Book::where('id', $bookId)->update([
            'rating_avg'   => $stats->avg_rating ? round($stats->avg_rating, 2) : 0,
            'rating_count' => $stats->rating_count ?? 0,
        ]);
    }
}
