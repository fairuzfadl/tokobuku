<?php

namespace App\Http\Controllers\Commerce;

use App\Exceptions\InsufficientStockException;
use App\Exceptions\VoucherInvalidException;
use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Services\CartService;
use App\Services\MidtransService;
use App\Services\OrderService;
use App\Services\VoucherService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CheckoutController extends Controller
{
    public function __construct(
        private CartService $cartService,
        private OrderService $orderService,
        private MidtransService $midtransService,
        private VoucherService $voucherService,
    ) {}

    public function index(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        $cart = $this->cartService->getOrCreateCart($user, null);
        $cart->load(['items.book.authors']);

        if ($cart->items->isEmpty()) {
            return redirect()->route('cart.index')->with('error', 'Keranjang kosong.');
        }

        $freeShippingThreshold = (int) Setting::get('free_shipping_threshold', 0);
        $flatShippingCost      = (int) Setting::get('flat_shipping_cost', 15000);

        return Inertia::render('Checkout/Index', [
            'cart'                    => $cart,
            'addresses'               => $user->addresses,
            'flat_shipping_cost'      => $flatShippingCost,
            'free_shipping_threshold' => $freeShippingThreshold,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'address_id'   => 'required|exists:addresses,id',
            'voucher_code' => 'nullable|string',
            'notes'        => 'nullable|string|max:500',
        ]);

        /** @var \App\Models\User $user */
        $user = $request->user();
        $cart = $this->cartService->getOrCreateCart($user, null);

        if ($cart->items->isEmpty()) {
            return back()->with('error', 'Keranjang kosong.');
        }

        $voucher = null;
        if ($request->voucher_code) {
            try {
                $cartTotal = $cart->items->sum(fn($i) => $i->price_snapshot * $i->quantity);
                $voucher = $this->voucherService->validate($request->voucher_code, $user, $cartTotal);
            } catch (VoucherInvalidException $e) {
                return back()->with('error', $e->getMessage());
            }
        }

        try {
            $order = $this->orderService->createFromCart($user, $cart, $request->all(), $voucher);
            $snapToken = $this->midtransService->createSnapToken($order);

            $order->payment()->create([
                'midtrans_order_id' => $order->order_number,
                'snap_token'        => $snapToken,
                'gross_amount'      => $order->total,
                'expired_at'        => now()->addHours(24),
            ]);

            return redirect()->route('checkout.payment', $order->order_number);
        } catch (InsufficientStockException $e) {
            return back()->with('error', $e->getMessage());
        } catch (\Exception $e) {
            report($e);
            return back()->with('error', 'Terjadi kesalahan. Silakan coba lagi.');
        }
    }

    public function payment(Request $request, string $orderNumber)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        $order = $user->orders()
            ->where('order_number', $orderNumber)
            ->with(['items', 'payment'])
            ->firstOrFail();

        $order = $this->midtransService->syncOrderStatus($order);

        if (in_array($order->status, ['paid', 'shipped', 'completed'])) {
            return redirect()
                ->route('checkout.success', $order->order_number)
                ->with('success', 'Pesanan ini sudah dibayar.');
        }

        if ($order->status === 'cancelled') {
            return redirect()
                ->route('orders.show', $order->order_number)
                ->with('error', 'Pesanan ini sudah dibatalkan atau kedaluwarsa.');
        }

        $snapToken = $order->payment?->snap_token;
        if (!$snapToken) {
            return redirect()->route('orders.show', $orderNumber);
        }

        return Inertia::render('Checkout/Payment', [
            'order'      => $order,
            'snap_token' => $snapToken,
        ]);
    }

    public function success(Request $request, string $orderNumber)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        $order = $user->orders()
            ->where('order_number', $orderNumber)
            ->with('payment')
            ->firstOrFail();

        $order = $this->midtransService->syncOrderStatus($order);

        if (!in_array($order->status, ['paid', 'shipped', 'completed'])) {
            $message = match ($order->status) {
                'cancelled' => 'Pembayaran dibatalkan atau kedaluwarsa.',
                default     => 'Pembayaran belum diterima. Selesaikan pembayaran terlebih dahulu.',
            };
            return redirect()
                ->route('orders.show', $order->order_number)
                ->with('error', $message);
        }

        return Inertia::render('Checkout/Success', ['order' => $order]);
    }

    public function checkPaymentStatus(Request $request, string $orderNumber)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        $order = $user->orders()
            ->where('order_number', $orderNumber)
            ->with('payment')
            ->firstOrFail();

        $order = $this->midtransService->syncOrderStatus($order);

        return response()->json(['status' => $order->status]);
    }

    public function applyVoucher(Request $request)
    {
        $request->validate(['code' => 'required|string', 'cart_total' => 'required|numeric']);

        try {
            /** @var \App\Models\User $user */
            $user = $request->user();
            $voucher = $this->voucherService->validate($request->code, $user, $request->cart_total);
            return response()->json([
                'valid'   => true,
                'voucher' => $voucher->only(['code', 'type', 'value', 'max_discount', 'min_order']),
            ]);
        } catch (VoucherInvalidException $e) {
            return response()->json(['valid' => false, 'message' => $e->getMessage()]);
        }
    }
}
