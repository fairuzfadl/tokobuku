<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Author;
use App\Models\Book;
use App\Models\Category;
use App\Models\Publisher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class BookController extends Controller
{
    public function index(Request $request)
    {
        $books = Book::with(['authors', 'category'])
            ->when($request->search, fn($q, $s) => $q->where('title', 'like', "%{$s}%")->orWhere('isbn', 'like', "%{$s}%"))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Books/Index', ['books' => $books, 'filters' => $request->only('search')]);
    }

    public function create()
    {
        return Inertia::render('Admin/Books/Form', [
            'categories' => Category::where('is_active', true)->orderBy('name')->get(),
            'authors'    => Author::orderBy('name')->get(),
            'publishers' => Publisher::orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateBook($request);
        $data = $this->handleFileUploads($request, $data);
        $data['cover_image'] = $data['cover_image'] ?? asset('images/book-placeholder.png');

        $book = Book::create($data);

        if ($request->author_ids) {
            $pivotData = collect($request->author_ids)->mapWithKeys(fn($id) => [$id => ['role' => 'author']]);
            $book->authors()->sync($pivotData);
        }

        Cache::flush();

        return redirect()->route('admin.books.index')->with('success', 'Buku berhasil ditambahkan.');
    }

    public function edit(Book $book)
    {
        $book->load('authors');
        return Inertia::render('Admin/Books/Form', [
            'book'       => $book,
            'categories' => Category::where('is_active', true)->orderBy('name')->get(),
            'authors'    => Author::orderBy('name')->get(),
            'publishers' => Publisher::orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, Book $book)
    {
        $data = $this->validateBook($request, $book);
        $data = $this->handleFileUploads($request, $data, $book);

        $book->update($data);

        if ($request->author_ids) {
            $pivotData = collect($request->author_ids)->mapWithKeys(fn($id) => [$id => ['role' => 'author']]);
            $book->authors()->sync($pivotData);
        }

        Cache::flush();

        return redirect()->route('admin.books.index')->with('success', 'Buku berhasil diperbarui.');
    }

    public function destroy(Book $book)
    {
        $book->delete();
        Cache::flush();

        return back()->with('success', 'Buku berhasil dihapus.');
    }

    public function toggleActive(Book $book)
    {
        $book->update(['is_active' => !$book->is_active]);
        Cache::flush();

        return back();
    }

    private function validateBook(Request $request, ?Book $book = null): array
    {
        return $request->validate([
            'title'            => 'required|string|max:500',
            'category_id'      => 'nullable|exists:categories,id',
            'publisher_id'     => 'nullable|exists:publishers,id',
            'isbn'             => 'nullable|string|max:20|unique:books,isbn' . ($book ? ",{$book->id}" : ''),
            'synopsis'         => 'nullable|string',
            'cover_image'      => 'nullable|image|max:2048',
            'digital_file'     => 'nullable|file|mimes:pdf|max:51200',
            'book_type'        => 'required|in:physical,digital,both',
            'language'         => 'nullable|string|max:50',
            'pages'            => 'nullable|integer|min:1',
            'weight'           => 'nullable|integer|min:1',
            'price'            => 'required|numeric|min:0',
            'digital_price'    => 'nullable|numeric|min:0',
            'discount_percent' => 'nullable|integer|between:0,100',
            'discount_until'   => 'nullable|date',
            'stock'            => 'required|integer|min:0',
            'is_featured'      => 'boolean',
            'is_active'        => 'boolean',
            'meta_title'       => 'nullable|string|max:160',
            'meta_description' => 'nullable|string|max:320',
        ]);
    }

    private function handleFileUploads(Request $request, array $data, ?Book $existing = null): array
    {
        if ($request->hasFile('cover_image')) {
            if ($existing?->cover_image && !str_starts_with($existing->cover_image, 'http') && Storage::disk('public')->exists($existing->cover_image)) {
                Storage::disk('public')->delete($existing->cover_image);
            }
            $path = $request->file('cover_image')->store('books/covers', 'public');
            $data['cover_image'] = Storage::disk('public')->url($path);
        } else {
            unset($data['cover_image']);
        }

        if ($request->hasFile('digital_file')) {
            $data['digital_file'] = $request->file('digital_file')->store('books/digital', 'public');
        } else {
            unset($data['digital_file']);
        }

        return $data;
    }
}
