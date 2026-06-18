<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function show(User $user)
    {
        $user->loadCount('orders');
        $user->load(['orders' => fn($q) => $q->latest()->limit(10)->select('id', 'user_id', 'order_number', 'total', 'status', 'created_at')]);
        return Inertia::render('Admin/Users/Show', ['user' => $user]);
    }

    public function index(Request $request)
    {
        $users = User::when(
                $request->search,
                fn($q, $s) => $q->where('name', 'like', "%{$s}%")->orWhere('email', 'like', "%{$s}%")
            )
            ->withCount('orders')
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Users/Index', [
            'users'   => $users,
            'filters' => $request->only('search'),
        ]);
    }

    public function toggleActive(User $user)
    {
        $user->update(['is_active' => !$user->is_active]);
        return back()->with('success', 'Status pengguna diperbarui.');
    }

    public function toggleRole(User $user)
    {
        $user->update(['role' => $user->role === 'admin' ? 'user' : 'admin']);
        return back()->with('success', 'Role pengguna diperbarui.');
    }
}
