<?php

namespace App\Services;

use App\Events\OrderPlaced;
use App\Exceptions\InsufficientStockException;
use App\Models\Book;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Models\Voucher;
use Illuminate\Support\Facades\DB;

class OrderService
{
    public function createFromCart(User $user, Cart $cart, array $data, ?Voucher $voucher = null): Order
    {
        return DB::transaction(function () use ($user, $cart, $data, $voucher) {
            $cartItems = $cart->items()->with('book')->get();
            $bookIds = $cartItems->pluck('book_id');

            // Lock buku untuk mencegah race condition
            $books = Book::whereIn('id', $bookIds)->lockForUpdate()->get()->keyBy('id');

            // Validasi stok
            foreach ($cartItems as $item) {
                if ($item->book_type === 'physical') {
                    $book = $books[$item->book_id];
                    if ($book->stock < $item->quantity) {
                        throw new InsufficientStockException("Stok '{$book->title}' tidak mencukupi.");
                    }
                }
            }

            $subtotal = $cartItems->sum(fn($i) => $i->price_snapshot * $i->quantity);
            $shippingCost = $data['shipping_cost'] ?? 0;
            $discountAmount = 0;

            if ($voucher && $voucher->isValid()) {
                $discountAmount = $this->calculateDiscount($voucher, $subtotal);
            }

            $total = max(0, $subtotal + $shippingCost - $discountAmount);

            // Buat order
            $order = Order::create([
                'order_number'    => $this->generateOrderNumber(),
                'user_id'         => $user->id,
                'address_id'      => $data['address_id'] ?? null,
                'voucher_id'      => $voucher?->id,
                'status'          => 'pending',
                'subtotal'        => $subtotal,
                'shipping_cost'   => $shippingCost,
                'discount_amount' => $discountAmount,
                'total'           => $total,
                'shipping_courier' => $data['shipping_courier'] ?? null,
                'shipping_service' => $data['shipping_service'] ?? null,
                'notes'           => $data['notes'] ?? null,
            ]);

            // Buat order items & kurangi stok
            foreach ($cartItems as $item) {
                OrderItem::create([
                    'order_id'   => $order->id,
                    'book_id'    => $item->book_id,
                    'book_type'  => $item->book_type,
                    'quantity'   => $item->quantity,
                    'unit_price' => $item->price_snapshot,
                    'subtotal'   => $item->price_snapshot * $item->quantity,
                    'book_title' => $item->book->title,
                    'book_cover' => $item->book->cover_image,
                ]);

                if ($item->book_type === 'physical') {
                    Book::where('id', $item->book_id)->decrement('stock', $item->quantity);
                }
            }

            // Catat penggunaan voucher
            if ($voucher && $discountAmount > 0) {
                $voucher->usages()->create([
                    'user_id'         => $user->id,
                    'order_id'        => $order->id,
                    'discount_amount' => $discountAmount,
                ]);
                $voucher->increment('used_count');
            }

            // Kosongkan cart
            $cart->items()->delete();

            event(new OrderPlaced($order));

            return $order;
        });
    }

    private function calculateDiscount(Voucher $voucher, float $subtotal): float
    {
        if ($subtotal < $voucher->min_order) return 0;

        $discount = $voucher->type === 'percent'
            ? $subtotal * ($voucher->value / 100)
            : $voucher->value;

        if ($voucher->max_discount && $discount > $voucher->max_discount) {
            $discount = $voucher->max_discount;
        }

        return min($discount, $subtotal);
    }

    private function generateOrderNumber(): string
    {
        $date = now()->format('Ymd');
        $count = Order::whereDate('created_at', today())->count() + 1;
        return 'TKB-' . $date . '-' . str_pad($count, 6, '0', STR_PAD_LEFT);
    }
}
