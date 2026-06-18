<?php

namespace App\Http\Controllers\Catalog;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function show(string $slug, Request $request)
    {
        $category = Category::where('slug', $slug)->where('is_active', true)->firstOrFail();
        $books = Book::active()
            ->where('category_id', $category->id)
            ->with(['authors'])
            ->paginate(24)
            ->withQueryString();

        return Inertia::render('Catalog/Index', [
            'books'      => $books,
            'category'   => $category,
            'categories' => Category::whereNull('parent_id')->where('is_active', true)->orderBy('sort_order')->get(),
            'filters'    => [],
        ]);
    }
}
