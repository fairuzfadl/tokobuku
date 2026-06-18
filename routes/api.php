<?php

use App\Http\Controllers\Payment\MidtransWebhookController;
use Illuminate\Support\Facades\Route;

Route::post('/midtrans/callback', [MidtransWebhookController::class, 'handle'])
    ->middleware('App\Http\Middleware\ValidateMidtransSignature')
    ->name('midtrans.callback');
