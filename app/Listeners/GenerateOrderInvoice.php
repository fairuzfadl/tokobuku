<?php

namespace App\Listeners;

use App\Events\OrderPaid;
use App\Services\InvoiceService;
use Illuminate\Contracts\Queue\ShouldQueue;

class GenerateOrderInvoice implements ShouldQueue
{
    public string $queue = 'default';

    public function __construct(private InvoiceService $invoiceService) {}

    public function handle(OrderPaid $event): void
    {
        $this->invoiceService->generate($event->order);
    }
}
