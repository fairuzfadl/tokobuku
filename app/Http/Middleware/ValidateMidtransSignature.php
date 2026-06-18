<?php

namespace App\Http\Middleware;

use App\Services\MidtransService;
use Closure;
use Illuminate\Http\Request;

class ValidateMidtransSignature
{
    public function handle(Request $request, Closure $next)
    {
        $payload = $request->all();

        if (empty($payload['signature_key'])) {
            \Log::warning('Midtrans webhook: missing signature key', ['ip' => $request->ip()]);
            return response()->json(['message' => 'Invalid request'], 400);
        }

        $service = new MidtransService();
        $valid = $service->verifySignature(
            $payload['order_id'] ?? '',
            $payload['status_code'] ?? '',
            $payload['gross_amount'] ?? '',
            $payload['signature_key']
        );

        if (!$valid) {
            \Log::warning('Midtrans webhook: invalid signature', ['order_id' => $payload['order_id'] ?? null]);
            return response()->json(['message' => 'Invalid signature'], 403);
        }

        return $next($request);
    }
}
