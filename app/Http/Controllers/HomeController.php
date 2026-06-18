<?php

namespace App\Http\Controllers;

use App\Models\Banner;
use App\Models\Book;
use App\Models\Category;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
        $banners = Cache::remember('banners:active', 3600, fn() =>
            Banner::active()->get()
        );

        $featured = Cache::remember('books:featured', 600, fn() =>
            Book::active()->featured()
                ->with(['authors', 'category'])
                ->withCount('reviews')
                ->limit(8)->get()
        );

        $newArrivals = Cache::remember('books:new', 300, fn() =>
            Book::active()
                ->with(['authors', 'category'])
                ->latest()->limit(12)->get()
        );

        $categories = Cache::remember('categories:active', 86400, fn() =>
            Category::whereNull('parent_id')->where('is_active', true)
                ->orderBy('sort_order')->limit(12)->get()
        );

        return Inertia::render('Home', [
            'banners'     => $banners,
            'featured'    => $featured,
            'newArrivals' => $newArrivals,
            'categories'  => $categories,
        ]);
    }
}
