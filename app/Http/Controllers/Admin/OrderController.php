<?php

namespace App\Http\Controllers\Admin;

use App\Events\OrderShipped;
use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = Order::with(['user', 'payment'])
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->search, fn($q, $s) => $q->where('order_number', 'like', "%{$s}%")
                ->orWhereHas('user', fn($u) => $u->where('name', 'like', "%{$s}%")))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Orders/Index', [
            'orders'  => $orders,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    public function show(string $orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)
            ->with(['items.book', 'user', 'address', 'payment'])
            ->firstOrFail();

        return Inertia::render('Admin/Orders/Show', ['order' => $order]);
    }

    public function updateStatus(Request $request, string $orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)->firstOrFail();

        $request->validate([
            'status'           => 'required|in:processing,shipped,completed,cancelled,refunded',
            'tracking_number'  => 'nullable|string|max:100',
            'shipping_courier' => 'nullable|string|max:50',
        ]);

        $updates = ['status' => $request->status];

        if ($request->status === 'shipped') {
            $updates['shipped_at'] = now();
            if ($request->tracking_number) $updates['tracking_number'] = $request->tracking_number;
            if ($request->shipping_courier) $updates['shipping_courier'] = $request->shipping_courier;
        }
        if ($request->status === 'completed') $updates['completed_at'] = now();
        if ($request->status === 'cancelled') $updates['cancelled_at'] = now();

        $order->update($updates);

        if ($request->status === 'shipped') {
            event(new OrderShipped($order));
        }

        return back()->with('success', 'Status pesanan diperbarui.');
    }

    public function downloadInvoice(string $orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)->firstOrFail();

        if (!$order->invoice_path || !\Illuminate\Support\Facades\Storage::exists($order->invoice_path)) {
            abort(404, 'Invoice belum tersedia.');
        }

        return \Illuminate\Support\Facades\Storage::download(
            $order->invoice_path,
            "Invoice-{$orderNumber}.pdf"
        );
    }
}
