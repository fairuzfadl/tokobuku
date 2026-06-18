<?php

namespace App\Http\Controllers\Catalog;

use App\Http\Controllers\Controller;
use App\Models\Author;
use App\Models\Book;
use App\Models\Category;
use App\Models\Publisher;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Book::active()->with(['authors', 'category', 'publisher']);

        if ($search = $request->get('q')) {
            $query->search($search);
        }

        if ($categoryId = $request->get('kategori')) {
            $query->where('category_id', $categoryId);
        }

        if ($authorId = $request->get('penulis')) {
            $query->whereHas('authors', fn($q) => $q->where('authors.id', $authorId));
        }

        if ($minPrice = $request->get('harga_min')) {
            $query->where('price', '>=', $minPrice);
        }

        if ($maxPrice = $request->get('harga_max')) {
            $query->where('price', '<=', $maxPrice);
        }

        if ($rating = $request->get('rating')) {
            $query->where('rating_avg', '>=', $rating);
        }

        if ($type = $request->get('jenis')) {
            $query->whereIn('book_type', [$type, 'both']);
        }

        $sort = $request->get('urutkan', 'terbaru');
        match ($sort) {
            'harga_asc'   => $query->orderBy('price'),
            'harga_desc'  => $query->orderByDesc('price'),
            'rating'      => $query->orderByDesc('rating_avg'),
            'terlaris'    => $query->orderByDesc('sold_count'),
            default       => $query->latest(),
        };

        $books = $query->paginate(24)->withQueryString();

        return Inertia::render('Catalog/Index', [
            'books'      => $books,
            'categories' => Category::whereNull('parent_id')->where('is_active', true)->orderBy('sort_order')->get(),
            'filters'    => $request->only(['q', 'kategori', 'penulis', 'harga_min', 'harga_max', 'rating', 'jenis', 'urutkan']),
        ]);
    }

    public function show(string $slug): Response
    {
        $book = Book::active()
            ->where('slug', $slug)
            ->with(['authors', 'category', 'publisher', 'images'])
            ->withCount('reviews')
            ->firstOrFail();

        $reviews = $book->reviews()
            ->with('user:id,name,avatar')
            ->latest()
            ->paginate(10);

        $related = Book::active()
            ->where('category_id', $book->category_id)
            ->where('id', '!=', $book->id)
            ->with(['authors'])
            ->limit(6)->get();

        return Inertia::render('Catalog/Show', [
            'book'    => $book,
            'reviews' => $reviews,
            'related' => $related,
        ]);
    }
}
