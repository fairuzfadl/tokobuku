<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Author;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AuthorController extends Controller
{
    public function index(Request $request)
    {
        $authors = Author::withCount('books')
            ->when($request->search, fn($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Authors/Index', [
            'authors' => $authors,
            'filters' => $request->only('search'),
        ]);
    }

    public function show(Author $author)
    {
        $author->load(['books' => fn($q) => $q->with('category:id,name')->orderBy('title')]);
        return Inertia::render('Admin/Authors/Show', ['author' => $author]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:150',
            'bio'         => 'nullable|string',
            'nationality' => 'nullable|string|max:100',
        ]);
        $data['slug'] = Str::slug($data['name']);
        Author::create($data);

        return back()->with('success', 'Penulis ditambahkan.');
    }

    public function update(Request $request, Author $author)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:150',
            'bio'         => 'nullable|string',
            'nationality' => 'nullable|string|max:100',
        ]);
        $data['slug'] = Str::slug($data['name']);
        $author->update($data);

        return back()->with('success', 'Penulis diperbarui.');
    }

    public function destroy(Author $author)
    {
        $author->delete();
        return back()->with('success', 'Penulis dihapus.');
    }
}
