<?php

namespace App\Http\Middleware;

use App\Models\Cart;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();
        $cartCount = 0;
        $wishlistIds = [];

        if ($user) {
            $cart = Cart::where('user_id', $user->id)->with('items')->first();
            $cartCount = $cart ? $cart->items->sum('quantity') : 0;
            $wishlistIds = $user->wishlists()->pluck('book_id')->toArray();
        } else {
            $sessionId = $request->session()->getId();
            if ($sessionId) {
                $cart = Cart::where('session_id', $sessionId)->with('items')->first();
                $cartCount = $cart ? $cart->items->sum('quantity') : 0;
            }
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id'     => $user->id,
                    'name'   => $user->name,
                    'email'  => $user->email,
                    'role'   => $user->role,
                    'avatar' => $user->avatar,
                ] : null,
            ],
            'cart_count'   => $cartCount,
            'wishlist_ids' => $wishlistIds,
            'flash'        => [
                'success' => $request->session()->get('success'),
                'error'   => $request->session()->get('error'),
            ],
            'settings' => [
                'site_name'        => config('app.name'),
                'midtrans_snap_url' => config('midtrans.snap_url'),
                'midtrans_client_key' => config('midtrans.client_key'),
            ],
        ];
    }
}
