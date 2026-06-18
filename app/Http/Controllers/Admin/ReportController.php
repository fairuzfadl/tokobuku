<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $dateFrom = $request->date_from ? \Carbon\Carbon::parse($request->date_from)->startOfDay() : now()->subDays(30);
        $dateTo   = $request->date_to   ? \Carbon\Carbon::parse($request->date_to)->endOfDay()   : now()->endOfDay();

        $salesChart = Order::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('SUM(total) as revenue'),
            DB::raw('COUNT(*) as orders')
        )
            ->whereBetween('created_at', [$dateFrom, $dateTo])
            ->where('status', '!=', 'cancelled')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $topBooks = DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->select(
                'order_items.book_title as title',
                DB::raw('MAX(order_items.book_cover) as cover_image'),
                DB::raw('SUM(order_items.quantity) as total_sold'),
                DB::raw('SUM(order_items.subtotal) as total_revenue')
            )
            ->whereBetween('orders.created_at', [$dateFrom, $dateTo])
            ->where('orders.status', '!=', 'cancelled')
            ->groupBy('order_items.book_title')
            ->orderByDesc('total_sold')
            ->limit(10)
            ->get();

        $completedOrders = Order::whereBetween('created_at', [$dateFrom, $dateTo])->where('status', 'completed')->count();
        $totalRevenue = Order::whereBetween('created_at', [$dateFrom, $dateTo])->where('status', '!=', 'cancelled')->sum('total');
        $totalOrders = Order::whereBetween('created_at', [$dateFrom, $dateTo])->count();
        $avgOrder = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;

        $stats = [
            'total_orders'     => $totalOrders,
            'completed_orders' => $completedOrders,
            'total_revenue'    => $totalRevenue,
            'avg_order'        => $avgOrder,
            'total_sold'       => DB::table('order_items')->join('orders', 'orders.id', '=', 'order_items.order_id')->whereBetween('orders.created_at', [$dateFrom, $dateTo])->where('orders.status', '!=', 'cancelled')->sum('order_items.quantity'),
        ];

        return Inertia::render('Admin/Reports/Index', [
            'salesChart' => $salesChart,
            'topBooks'   => $topBooks,
            'stats'      => $stats,
            'filters'    => $request->only(['date_from', 'date_to']),
        ]);
    }

    public function export(Request $request)
    {
        $dateFrom = $request->date_from ? \Carbon\Carbon::parse($request->date_from)->startOfDay() : now()->subDays(30);
        $dateTo   = $request->date_to   ? \Carbon\Carbon::parse($request->date_to)->endOfDay()   : now()->endOfDay();

        $orders = Order::with(['user', 'items'])
            ->whereBetween('created_at', [$dateFrom, $dateTo])
            ->where('status', '!=', 'cancelled')
            ->orderBy('created_at')
            ->get();

        $filename = 'laporan-penjualan-' . now()->format('Y-m-d-His') . '.csv';
        $headers = [
            'Content-Type'        => 'text/csv; charset=utf-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($orders) {
            $file = fopen('php://output', 'w');
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF)); // UTF-8 BOM

            fputcsv($file, ['No. Pesanan', 'Pembeli', 'Email', 'Status', 'Subtotal', 'Ongkir', 'Diskon', 'Total', 'Tanggal']);

            foreach ($orders as $order) {
                fputcsv($file, [
                    $order->order_number,
                    $order->user?->name ?? '-',
                    $order->user?->email ?? '-',
                    $order->status,
                    number_format($order->subtotal, 2, ',', '.'),
                    number_format($order->shipping_cost, 2, ',', '.'),
                    number_format($order->discount_amount, 2, ',', '.'),
                    number_format($order->total, 2, ',', '.'),
                    $order->created_at->format('d/m/Y H:i'),
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
