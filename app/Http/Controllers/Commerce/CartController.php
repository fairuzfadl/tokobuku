<?php

namespace App\Http\Controllers\Commerce;

use App\Exceptions\InsufficientStockException;
use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Services\CartService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CartController extends Controller
{
    public function __construct(private CartService $cartService) {}

    public function index(Request $request)
    {
        $cart = $this->cartService->getOrCreateCart(auth()->user(), $request->session()->getId());
        $cart->load(['items.book.authors', 'items.book.category']);

        return Inertia::render('Cart/Index', [
            'cart' => $cart,
        ]);
    }

    public function add(Request $request)
    {
        $request->validate([
            'book_id'   => 'required|exists:books,id',
            'book_type' => 'required|in:physical,digital',
            'quantity'  => 'required|integer|min:1|max:99',
        ]);

        $book = Book::active()->findOrFail($request->book_id);
        $cart = $this->cartService->getOrCreateCart(auth()->user(), $request->session()->getId());

        try {
            $this->cartService->addItem($cart, $book, $request->book_type, $request->quantity);
        } catch (InsufficientStockException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Buku ditambahkan ke keranjang.');
    }

    public function update(Request $request, int $item)
    {
        $request->validate(['quantity' => 'required|integer|min:0|max:99']);
        $cart = $this->cartService->getOrCreateCart(auth()->user(), $request->session()->getId());

        try {
            $this->cartService->updateQuantity($cart, $item, $request->quantity);
        } catch (InsufficientStockException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back();
    }

    public function remove(Request $request, int $item)
    {
        $cart = $this->cartService->getOrCreateCart(auth()->user(), $request->session()->getId());
        $this->cartService->removeItem($cart, $item);

        return back()->with('success', 'Item dihapus dari keranjang.');
    }
}
