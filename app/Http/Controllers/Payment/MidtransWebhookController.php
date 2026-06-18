<?php

namespace App\Http\Controllers\Payment;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessMidtransCallback;
use Illuminate\Http\Request;

class MidtransWebhookController extends Controller
{
    public function handle(Request $request)
    {
        // Proses via job agar response cepat (Midtrans butuh < 10 detik)
        ProcessMidtransCallback::dispatch($request->all())->onQueue('high');

        return response()->json(['message' => 'OK'], 200);
    }
}
