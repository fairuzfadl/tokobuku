<?php

use App\Http\Controllers\Catalog\BookController;
use App\Http\Controllers\Catalog\CategoryController as CatalogCategoryController;
use App\Http\Controllers\Commerce\CartController;
use App\Http\Controllers\Commerce\CheckoutController;
use App\Http\Controllers\Commerce\OrderController;
use App\Http\Controllers\Commerce\ReviewController;
use App\Http\Controllers\Commerce\WishlistController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\User\AddressController;
use App\Http\Controllers\User\NotificationController;
use App\Http\Controllers\User\ProfileController;
use App\Http\Controllers\Admin;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

// Public
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/dashboard', function () {
    if (Auth::user()?->role === 'admin') {
        return redirect()->route('admin.dashboard');
    }

    return redirect()->route('home');
})->middleware('auth')->name('dashboard');
Route::get('/katalog', [BookController::class, 'index'])->name('catalog.index');
Route::get('/katalog/{slug}', [BookController::class, 'show'])->name('catalog.show');
Route::get('/kategori/{slug}', [CatalogCategoryController::class, 'show'])->name('category.show');

// Cart (works as guest too)
Route::prefix('keranjang')->name('cart.')->group(function () {
    Route::get('/', [CartController::class, 'index'])->name('index');
    Route::post('/tambah', [CartController::class, 'add'])->name('add');
    Route::patch('/{item}', [CartController::class, 'update'])->name('update');
    Route::delete('/{item}', [CartController::class, 'remove'])->name('remove');
});

// Authenticated user area
Route::middleware(['auth', 'verified'])->group(function () {

    // Checkout
    Route::prefix('checkout')->name('checkout.')->group(function () {
        Route::get('/', [CheckoutController::class, 'index'])->name('index');
        Route::post('/', [CheckoutController::class, 'store'])->name('store');
        Route::get('/sukses/{orderNumber}', [CheckoutController::class, 'success'])->name('success');
        Route::get('/payment/{orderNumber}', [CheckoutController::class, 'payment'])->name('payment');
        Route::post('/voucher', [CheckoutController::class, 'applyVoucher'])->name('voucher');
        Route::post('/payment/{orderNumber}/check', [CheckoutController::class, 'checkPaymentStatus'])->name('checkStatus');
    });

    // Orders
    Route::prefix('pesanan')->name('orders.')->group(function () {
        Route::get('/', [OrderController::class, 'index'])->name('index');
        Route::get('/{orderNumber}', [OrderController::class, 'show'])->name('show');
        Route::post('/{order}/batal', [OrderController::class, 'cancel'])->name('cancel');
        Route::get('/{orderNumber}/invoice', [OrderController::class, 'downloadInvoice'])->name('invoice');
        Route::get('/{orderNumber}/unduh/{item}', [OrderController::class, 'downloadDigital'])->name('download');
        Route::get('/{orderNumber}/lacak', [OrderController::class, 'tracking'])->name('tracking');
    });

    // Wishlist
    Route::prefix('wishlist')->name('wishlist.')->group(function () {
        Route::get('/', [WishlistController::class, 'index'])->name('index');
        Route::post('/toggle/{book}', [WishlistController::class, 'toggle'])->name('toggle');
    });

    // Reviews
    Route::post('/ulasan', [ReviewController::class, 'store'])->name('reviews.store');

    // Profile
    Route::prefix('profil')->name('profile.')->group(function () {
        Route::get('/', [ProfileController::class, 'index'])->name('index');
        Route::post('/update', [ProfileController::class, 'update'])->name('update');
        Route::post('/password', [ProfileController::class, 'updatePassword'])->name('password');
        Route::post('/avatar', [ProfileController::class, 'updateAvatar'])->name('avatar');

        Route::prefix('alamat')->name('addresses.')->group(function () {
            Route::get('/', [AddressController::class, 'index'])->name('index');
            Route::post('/', [AddressController::class, 'store'])->name('store');
            Route::patch('/{address}', [AddressController::class, 'update'])->name('update');
            Route::delete('/{address}', [AddressController::class, 'destroy'])->name('destroy');
            Route::patch('/{address}/default', [AddressController::class, 'setDefault'])->name('default');
        });
    });

    // Notifications
    Route::prefix('notifikasi')->name('notifications.')->group(function () {
        Route::get('/', [NotificationController::class, 'index'])->name('index');
        Route::patch('/{id}/baca', [NotificationController::class, 'markRead'])->name('read');
        Route::patch('/baca-semua', [NotificationController::class, 'markAllRead'])->name('readAll');
    });
});

// Admin area
Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [Admin\DashboardController::class, 'index'])->name('dashboard');

    // Books
    Route::resource('books', Admin\BookController::class);
    Route::patch('books/{book}/toggle-active', [Admin\BookController::class, 'toggleActive'])->name('books.toggleActive');

    // Categories, Authors, Publishers
    Route::resource('categories', Admin\CategoryController::class);
    Route::patch('categories/{category}/toggle-active', [Admin\CategoryController::class, 'toggleActive'])->name('categories.toggleActive');
    Route::resource('authors', Admin\AuthorController::class);
    Route::resource('publishers', Admin\PublisherController::class);

    // Orders
    Route::prefix('orders')->name('orders.')->group(function () {
        Route::get('/', [Admin\OrderController::class, 'index'])->name('index');
        Route::get('/{orderNumber}', [Admin\OrderController::class, 'show'])->name('show');
        Route::patch('/{orderNumber}/status', [Admin\OrderController::class, 'updateStatus'])->name('updateStatus');
        Route::get('/{orderNumber}/invoice', [Admin\OrderController::class, 'downloadInvoice'])->name('invoice');
    });

    // Users
    Route::resource('users', Admin\UserController::class)->only(['index', 'show']);
    Route::patch('users/{user}/toggle-active', [Admin\UserController::class, 'toggleActive'])->name('users.toggleActive');
    Route::patch('users/{user}/toggle-role', [Admin\UserController::class, 'toggleRole'])->name('users.toggleRole');

    // Vouchers, Banners
    Route::resource('vouchers', Admin\VoucherController::class);
    Route::patch('vouchers/{voucher}/toggle-active', [Admin\VoucherController::class, 'toggleActive'])->name('vouchers.toggleActive');
    Route::resource('banners', Admin\BannerController::class);
    Route::patch('banners/{banner}/toggle-active', [Admin\BannerController::class, 'toggleActive'])->name('banners.toggleActive');

    // Reviews
    Route::get('reviews', [Admin\ReviewController::class, 'index'])->name('reviews.index');
    Route::patch('reviews/{review}/approve', [Admin\ReviewController::class, 'approve'])->name('reviews.approve');
    Route::delete('reviews/{review}', [Admin\ReviewController::class, 'destroy'])->name('reviews.destroy');

    // Reports
    Route::get('reports', [Admin\ReportController::class, 'index'])->name('reports.index');
    Route::get('reports/export', [Admin\ReportController::class, 'export'])->name('reports.export');

    // Settings
    Route::get('settings', [Admin\SettingController::class, 'index'])->name('settings.index');
    Route::post('settings', [Admin\SettingController::class, 'update'])->name('settings.update');
});

require __DIR__.'/auth.php';
