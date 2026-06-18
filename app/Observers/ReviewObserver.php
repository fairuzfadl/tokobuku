<?php

namespace App\Observers;

use App\Models\Review;

class ReviewObserver
{
    public function saved(Review $review): void
    {
        $this->recalculateRating($review->book_id);
    }

    public function deleted(Review $review): void
    {
        $this->recalculateRating($review->book_id);
    }

    private function recalculateRating(int $bookId): void
    {
        $stats = Review::where('book_id', $bookId)
            ->where('is_approved', true)
            ->selectRaw('AVG(rating) as avg_rating, COUNT(*) as count')
            ->first();

        \App\Models\Book::where('id', $bookId)->update([
            'rating_avg' => round($stats->avg_rating ?? 0, 1),
            'rating_count' => $stats->count ?? 0,
        ]);
    }
}
