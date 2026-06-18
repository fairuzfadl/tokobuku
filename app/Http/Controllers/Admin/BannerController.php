<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
class BannerController extends Controller {
    public function index() {
        return Inertia::render('Admin/Banners/Index', [
            'banners' => Banner::orderBy('sort_order')->get(),
        ]);
    }

    public function show(Banner $banner) {
        return Inertia::render('Admin/Banners/Show', ['banner' => $banner]);
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'title'      => 'required|string|max:150',
            'subtitle'   => 'nullable|string|max:300',
            'image'      => 'nullable|image|max:2048',
            'link'       => 'nullable|string|max:500',
            'sort_order' => 'nullable|integer',
            'is_active'  => 'boolean',
            'starts_at'  => 'nullable|date',
            'ends_at'    => 'nullable|date',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('banners', 'public');
            $validated['image'] = Storage::disk('public')->url($path);
        }

        Banner::create($validated);
        Cache::forget('banners:active');

        return back()->with('success', 'Banner ditambahkan.');
    }

    public function update(Request $request, Banner $banner) {
        $validated = $request->validate([
            'title'      => 'required|string|max:150',
            'subtitle'   => 'nullable|string|max:300',
            'image'      => 'nullable|image|max:2048',
            'link'       => 'nullable|string|max:500',
            'sort_order' => 'nullable|integer',
            'is_active'  => 'boolean',
            'starts_at'  => 'nullable|date',
            'ends_at'    => 'nullable|date',
        ]);

        if ($request->hasFile('image')) {
            if ($banner->image && str_contains($banner->image, '/storage/')) {
                $oldPath = str_replace('/storage/', '', parse_url($banner->image, PHP_URL_PATH));
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('image')->store('banners', 'public');
            $validated['image'] = Storage::disk('public')->url($path);
        } else {
            unset($validated['image']);
        }

        $banner->update($validated);
        Cache::forget('banners:active');

        return back()->with('success', 'Banner diperbarui.');
    }

    public function toggleActive(Banner $banner) {
        $banner->update(['is_active' => !$banner->is_active]);
        Cache::forget('banners:active');
        return back()->with('success', 'Status banner diperbarui.');
    }

    public function destroy(Banner $banner) {
        if ($banner->image && str_contains($banner->image, '/storage/')) {
            $oldPath = str_replace('/storage/', '', parse_url($banner->image, PHP_URL_PATH));
            Storage::disk('public')->delete($oldPath);
        }
        $banner->delete();
        Cache::forget('banners:active');

        return back()->with('success', 'Banner dihapus.');
    }
}
