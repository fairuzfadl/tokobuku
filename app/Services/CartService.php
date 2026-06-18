<?php

namespace App\Services;

use App\Exceptions\InsufficientStockException;
use App\Models\Book;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\User;

class CartService
{
    public function getOrCreateCart(?User $user, ?string $sessionId): Cart
    {
        if ($user) {
            return Cart::firstOrCreate(['user_id' => $user->id]);
        }
        return Cart::firstOrCreate(['session_id' => $sessionId]);
    }

    public function addItem(Cart $cart, Book $book, string $bookType, int $quantity): CartItem
    {
        $price = $bookType === 'digital' ? ($book->digital_price ?? $book->price) : $book->final_price;

        $item = $cart->items()->where('book_id', $book->id)->where('book_type', $bookType)->first();
        $newQuantity = ($item?->quantity ?? 0) + $quantity;

        if ($bookType === 'physical' && $newQuantity > $book->stock) {
            throw new InsufficientStockException(
                "Stok '{$book->title}' hanya tersisa {$book->stock}. Tidak bisa menambah lagi."
            );
        }

        if ($item) {
            $item->increment('quantity', $quantity);
            return $item->fresh();
        }

        return $cart->items()->create([
            'book_id'        => $book->id,
            'book_type'      => $bookType,
            'quantity'       => $quantity,
            'price_snapshot' => $price,
        ]);
    }

    public function removeItem(Cart $cart, int $cartItemId): void
    {
        $cart->items()->where('id', $cartItemId)->delete();
    }

    public function updateQuantity(Cart $cart, int $cartItemId, int $quantity): void
    {
        if ($quantity <= 0) {
            $this->removeItem($cart, $cartItemId);
            return;
        }

        $item = $cart->items()->with('book')->find($cartItemId);
        if (!$item) return;

        if ($item->book_type === 'physical' && $quantity > $item->book->stock) {
            throw new InsufficientStockException(
                "Stok '{$item->book->title}' hanya tersisa {$item->book->stock}."
            );
        }

        $item->update(['quantity' => $quantity]);
    }

    public function mergeGuestCart(User $user, string $sessionId): void
    {
        $guestCart = Cart::where('session_id', $sessionId)->with('items')->first();
        if (!$guestCart || $guestCart->items->isEmpty()) return;

        $userCart = Cart::firstOrCreate(['user_id' => $user->id]);

        foreach ($guestCart->items as $guestItem) {
            $existing = $userCart->items()
                ->where('book_id', $guestItem->book_id)
                ->where('book_type', $guestItem->book_type)
                ->first();

            if ($existing) {
                $existing->increment('quantity', $guestItem->quantity);
            } else {
                $userCart->items()->create($guestItem->only(['book_id', 'book_type', 'quantity', 'price_snapshot']));
            }
        }

        $guestCart->items()->delete();
        $guestCart->delete();
    }

    public function getItemCount(Cart $cart): int
    {
        return $cart->items()->sum('quantity');
    }
}
