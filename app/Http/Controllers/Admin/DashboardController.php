<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Order;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $today = today();
        $thisMonth = now()->startOfMonth();

        $stats = [
            'total_orders_today'   => Order::whereDate('created_at', $today)->count(),
            'revenue_today'        => Order::whereDate('created_at', $today)->where('status', '!=', 'cancelled')->sum('total'),
            'total_orders_month'   => Order::where('created_at', '>=', $thisMonth)->count(),
            'revenue_month'        => Order::where('created_at', '>=', $thisMonth)->where('status', '!=', 'cancelled')->sum('total'),
            'total_users'          => User::where('role', 'user')->count(),
            'total_books'          => Book::count(),
            'pending_orders'       => Order::where('status', 'pending')->count(),
            'low_stock_books'      => Book::where('stock', '<', 5)->where('book_type', '!=', 'digital')->count(),
        ];

        $salesChart = Order::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('SUM(total) as revenue'),
            DB::raw('COUNT(*) as orders')
        )
            ->where('created_at', '>=', now()->subDays(30))
            ->where('status', '!=', 'cancelled')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $recentOrders = Order::with(['user', 'payment'])
            ->latest()->limit(10)->get();

        return Inertia::render('Admin/Dashboard', [
            'stats'        => $stats,
            'salesChart'   => $salesChart,
            'recentOrders' => $recentOrders,
        ]);
    }
}
