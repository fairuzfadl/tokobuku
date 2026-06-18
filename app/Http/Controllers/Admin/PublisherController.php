<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Publisher;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PublisherController extends Controller
{
    public function index(Request $request)
    {
        $publishers = Publisher::withCount('books')
            ->when($request->search, fn($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Publishers/Index', [
            'publishers' => $publishers,
            'filters'    => $request->only('search'),
        ]);
    }

    public function show(Publisher $publisher)
    {
        $publisher->load(['books' => fn($q) => $q->with('category:id,name')->orderBy('title')]);
        return Inertia::render('Admin/Publishers/Show', ['publisher' => $publisher]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:150',
            'description' => 'nullable|string',
            'website'     => 'nullable|url',
            'city'        => 'nullable|string|max:100',
        ]);
        $data['slug'] = Str::slug($data['name']);
        Publisher::create($data);

        return back()->with('success', 'Penerbit ditambahkan.');
    }

    public function update(Request $request, Publisher $publisher)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:150',
            'description' => 'nullable|string',
            'website'     => 'nullable|url',
            'city'        => 'nullable|string|max:100',
        ]);
        $data['slug'] = Str::slug($data['name']);
        $publisher->update($data);

        return back()->with('success', 'Penerbit diperbarui.');
    }

    public function destroy(Publisher $publisher)
    {
        $publisher->delete();
        return back()->with('success', 'Penerbit dihapus.');
    }
}
