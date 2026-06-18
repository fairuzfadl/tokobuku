<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Categories/Index', [
            'categories' => Category::with('parent')->withCount('books')->orderBy('sort_order')->get(),
        ]);
    }

    public function show(Category $category)
    {
        $category->load([
            'parent',
            'children' => fn($q) => $q->withCount('books')->orderBy('sort_order'),
            'books'    => fn($q) => $q->with('authors:id,name')->orderBy('title'),
        ]);
        return Inertia::render('Admin/Categories/Show', ['category' => $category]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'       => 'required|string|max:100',
            'parent_id'  => 'nullable|exists:categories,id',
            'sort_order' => 'nullable|integer',
            'is_active'  => 'boolean',
        ]);
        $data['slug'] = Str::slug($data['name']);
        Category::create($data);
        return back()->with('success', 'Kategori ditambahkan.');
    }

    public function update(Request $request, Category $category)
    {
        $data = $request->validate([
            'name'       => 'required|string|max:100',
            'parent_id'  => 'nullable|exists:categories,id',
            'sort_order' => 'nullable|integer',
            'is_active'  => 'boolean',
        ]);
        $data['slug'] = Str::slug($data['name']);
        $category->update($data);
        return back()->with('success', 'Kategori diperbarui.');
    }

    public function toggleActive(Category $category)
    {
        $category->update(['is_active' => !$category->is_active]);
        return back()->with('success', 'Status kategori diperbarui.');
    }

    public function destroy(Category $category)
    {
        $category->delete();
        return back()->with('success', 'Kategori dihapus.');
    }
}
