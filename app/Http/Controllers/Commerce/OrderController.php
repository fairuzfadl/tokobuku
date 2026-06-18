<?php

namespace App\Http\Controllers\Commerce;

use App\Events\OrderCancelled;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Review;
use App\Models\User;
use App\Services\MidtransService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function __construct(private MidtransService $midtransService) {}

    public function index(Request $request)
    {
        /** @var User $user */
        $user = $request->user();

        $orders = $user->orders()
            ->with(['items', 'payment'])
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate(10);

        return Inertia::render('Orders/Index', [
            'orders' => $orders,
            'currentStatus' => $request->status,
        ]);
    }

    public function show(Request $request, string $orderNumber)
    {
        /** @var User $user */
        $user = $request->user();

        $order = $user->orders()
            ->where('order_number', $orderNumber)
            ->with(['items', 'address', 'payment'])
            ->firstOrFail();

        if ($request->hasAny(['paid', 'order_id', 'transaction_status', 'status_code'])
            && $order->status === 'pending') {
            $order = $this->midtransService->syncOrderStatus($order)
                ->load(['items', 'address', 'payment']);
        }

        $order->items->transform(function ($item) use ($order) {
            $item->review_id = Review::where('order_id', $order->id)
                ->where('book_id', $item->book_id)
                ->value('id');
            return $item;
        });

        return Inertia::render('Orders/Show', [
            'order' => $order,
            'canReview' => $order->status === 'completed',
        ]);
    }

    public function tracking(Request $request, string $orderNumber)
    {
        /** @var User $user */
        $user = $request->user();
        $order = $user->orders()
            ->where('order_number', $orderNumber)
            ->firstOrFail();

        if (!$order->tracking_number || !$order->shipping_courier) {
            return response()->json(['error' => 'Nomor resi belum tersedia.'], 404);
        }

        $apiKey = config('services.binderbyte.key');
        if (!$apiKey) {
            return response()->json(['error' => 'Layanan tracking belum dikonfigurasi. Tambahkan BINDERBYTE_API_KEY di .env'], 503);
        }

        $courierMap = [
            'jne'          => 'jne',
            'j&t'          => 'jnt',
            'j&t express'  => 'jnt',
            'jnt'          => 'jnt',
            'sicepat'      => 'sicepat',
            'anteraja'     => 'anteraja',
            'tiki'         => 'tiki',
            'pos'          => 'pos',
            'pos indonesia' => 'pos',
            'sap'          => 'sap',
            'sap express'  => 'sap',
            'ninja'        => 'ninja',
            'ninja express' => 'ninja',
            'lion'         => 'lion',
            'lion parcel'  => 'lion',
            'wahana'       => 'wahana',
        ];
        $courierKey  = strtolower(trim($order->shipping_courier));
        $courierCode = $courierMap[$courierKey] ?? $courierKey;

        try {
            $response = Http::timeout(10)->get('https://api.binderbyte.com/v1/track', [
                'api_key' => $apiKey,
                'courier' => $courierCode,
                'awb'     => $order->tracking_number,
            ]);

            $body = $response->json();

            if (($body['code'] ?? '') !== '200') {
                return response()->json(['error' => $body['message'] ?? 'Data resi tidak ditemukan.'], 404);
            }

            return response()->json($body['data']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Gagal menghubungi layanan tracking.'], 503);
        }
    }

    public function cancel(Request $request, Order $order)
    {
        /** @var User $user */
        $user = $request->user();
        if ($order->user_id !== $user->id) abort(403);

        if ($order->status !== 'pending') {
            return back()->with('error', 'Pesanan tidak dapat dibatalkan.');
        }

        $order->update([
            'status'       => 'cancelled',
            'cancelled_at' => now(),
        ]);
        event(new OrderCancelled($order));

        return back()->with('success', 'Pesanan berhasil dibatalkan.');
    }

    public function downloadInvoice(Request $request, string $orderNumber)
    {
        /** @var User $user */
        $user = $request->user();
        $order = $user->orders()->where('order_number', $orderNumber)->firstOrFail();

        if (!$order->invoice_path || !Storage::exists($order->invoice_path)) {
            abort(404, 'Invoice belum tersedia.');
        }

        return Storage::download($order->invoice_path, "Invoice-{$orderNumber}.pdf");
    }

    public function downloadDigital(Request $request, string $orderNumber, int $itemId)
    {
        /** @var User $user */
        $user = $request->user();
        $order = $user->orders()
            ->where('order_number', $orderNumber)
            ->where('status', 'completed')
            ->firstOrFail();

        $item = $order->items()->where('id', $itemId)->where('book_type', 'digital')->firstOrFail();

        $book = \App\Models\Book::find($item->book_id);
        if (!$book || !$book->digital_file) {
            abort(404, 'File tidak tersedia.');
        }

        return Storage::download($book->digital_file, "{$item->book_title}.pdf");
    }
}
