<?php

namespace App\Services;

use App\Models\Order;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class InvoiceService
{
    public function generate(Order $order): string
    {
        $order->load(['items', 'user', 'address', 'payment']);

        $pdf = Pdf::loadView('pdf.invoice', ['order' => $order]);
        $pdf->setPaper('a4', 'portrait');

        $path = "invoices/{$order->order_number}.pdf";
        Storage::disk('local')->put($path, $pdf->output());

        $order->update(['invoice_path' => $path]);

        return $path;
    }
}
