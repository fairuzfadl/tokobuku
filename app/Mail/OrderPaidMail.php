<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

class OrderPaidMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Order $order) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: "Pembayaran #{$this->order->order_number} Berhasil — TokoBuku");
    }

    public function content(): Content
    {
        return new Content(view: 'emails.order-paid');
    }

    public function attachments(): array
    {
        if ($this->order->invoice_path && Storage::exists($this->order->invoice_path)) {
            return [
                \Illuminate\Mail\Mailables\Attachment::fromStorage($this->order->invoice_path)
                    ->as("Invoice-{$this->order->order_number}.pdf")
                    ->withMime('application/pdf'),
            ];
        }
        return [];
    }
}
