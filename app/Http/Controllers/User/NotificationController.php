<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        $notifications = $user->notifications()->paginate(20);

        return Inertia::render('Notifications/Index', ['notifications' => $notifications]);
    }

    public function markRead(Request $request, string $id)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        $user->notifications()->where('id', $id)->update(['read_at' => now()]);

        return back();
    }

    public function markAllRead(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        $user->unreadNotifications->markAsRead();

        return back();
    }
}
