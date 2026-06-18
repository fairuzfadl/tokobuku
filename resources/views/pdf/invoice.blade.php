<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'DejaVu Sans', sans-serif; font-size: 12px; color: #1f2937; background: #fff; }
  .container { padding: 32px; max-width: 800px; margin: 0 auto; }

  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
  .logo { font-size: 24px; font-weight: 800; color: #3b82f6; }
  .logo-sub { font-size: 11px; color: #6b7280; margin-top: 2px; }
  .invoice-meta { text-align: right; }
  .invoice-meta h1 { font-size: 20px; font-weight: 700; color: #111827; }
  .invoice-meta p { color: #6b7280; font-size: 11px; margin-top: 4px; }
  .badge { display: inline-block; background: #dbeafe; color: #1d4ed8; font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 999px; margin-top: 6px; }

  .info-grid { display: flex; gap: 24px; margin-bottom: 28px; }
  .info-box { flex: 1; background: #f9fafb; border-radius: 8px; padding: 14px 16px; }
  .info-box h3 { font-size: 10px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
  .info-box p { color: #111827; font-size: 12px; line-height: 1.6; }

  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  thead th { background: #3b82f6; color: #fff; padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 600; }
  thead th:last-child { text-align: right; }
  tbody td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 12px; vertical-align: top; }
  tbody td:last-child { text-align: right; font-weight: 600; }
  tbody tr:nth-child(even) td { background: #f9fafb; }

  .totals { margin-left: auto; width: 280px; }
  .totals-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 12px; }
  .totals-row.border-top { border-top: 2px solid #e5e7eb; margin-top: 6px; padding-top: 10px; }
  .totals-row.total { font-size: 15px; font-weight: 700; color: #3b82f6; }
  .totals-label { color: #6b7280; }
  .totals-value { font-weight: 500; color: #111827; }

  .footer { margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 16px; text-align: center; color: #9ca3af; font-size: 10px; line-height: 1.8; }
  .paid-stamp { text-align: center; margin: 20px 0; }
  .paid-stamp span { border: 3px solid #16a34a; color: #16a34a; font-size: 28px; font-weight: 800; padding: 6px 24px; border-radius: 4px; letter-spacing: 4px; transform: rotate(-10deg); display: inline-block; opacity: 0.7; }
</style>
</head>
<body>
<div class="container">
  {{-- Header --}}
  <div class="header">
    <div>
      <div class="logo">TokoBuku</div>
      <div class="logo-sub">Platform Jual Beli Buku Online</div>
      <div style="margin-top: 10px; font-size: 11px; color: #6b7280; line-height: 1.6;">
        Jl. Raya Buku No. 1, Jakarta Pusat<br>
        contact@tokobuku.id | +62 21 0000-0000
      </div>
    </div>
    <div class="invoice-meta">
      <h1>INVOICE</h1>
      <p>{{ $order->order_number }}</p>
      <p>{{ $order->created_at->format('d F Y') }}</p>
      @if($order->isPaid())
        <div class="badge">LUNAS</div>
      @endif
    </div>
  </div>

  {{-- Info Grid --}}
  <div class="info-grid">
    <div class="info-box">
      <h3>Tagihan Kepada</h3>
      <p>
        <strong>{{ $order->user->name }}</strong><br>
        {{ $order->user->email }}<br>
        {{ $order->user->phone ?? '-' }}
      </p>
    </div>
    <div class="info-box">
      <h3>Alamat Pengiriman</h3>
      @if($order->address)
      <p>
        {{ $order->address->recipient_name }}<br>
        {{ $order->address->full_address }}<br>
        {{ $order->address->city }}, {{ $order->address->province }} {{ $order->address->postal_code }}
      </p>
      @else
      <p>—</p>
      @endif
    </div>
    <div class="info-box">
      <h3>Info Pembayaran</h3>
      <p>
        @if($order->payment)
          Metode: {{ str_replace('_', ' ', $order->payment->payment_type ?? '-') }}<br>
          Status: {{ ucfirst($order->payment->payment_status ?? '-') }}<br>
          @if($order->payment->paid_at)
            Tgl Bayar: {{ \Carbon\Carbon::parse($order->payment->paid_at)->format('d/m/Y H:i') }}
          @endif
        @else
          —
        @endif
      </p>
    </div>
  </div>

  {{-- Items Table --}}
  <table>
    <thead>
      <tr>
        <th style="width: 40px">#</th>
        <th>Nama Buku</th>
        <th style="width: 80px; text-align: center">Tipe</th>
        <th style="width: 60px; text-align: center">Qty</th>
        <th style="width: 120px; text-align: right">Harga Satuan</th>
        <th style="width: 130px">Subtotal</th>
      </tr>
    </thead>
    <tbody>
      @foreach($order->items as $i => $item)
      <tr>
        <td>{{ $i + 1 }}</td>
        <td>{{ $item->book_title }}</td>
        <td style="text-align: center">{{ $item->book_type === 'digital' ? 'Digital' : 'Fisik' }}</td>
        <td style="text-align: center">{{ $item->quantity }}</td>
        <td style="text-align: right">{{ 'Rp ' . number_format($item->unit_price, 0, ',', '.') }}</td>
        <td>{{ 'Rp ' . number_format($item->subtotal, 0, ',', '.') }}</td>
      </tr>
      @endforeach
    </tbody>
  </table>

  {{-- Totals --}}
  <div class="totals">
    <div class="totals-row">
      <span class="totals-label">Subtotal</span>
      <span class="totals-value">Rp {{ number_format($order->subtotal, 0, ',', '.') }}</span>
    </div>
    <div class="totals-row">
      <span class="totals-label">Ongkos Kirim</span>
      <span class="totals-value">Rp {{ number_format($order->shipping_cost, 0, ',', '.') }}</span>
    </div>
    @if($order->discount_amount > 0)
    <div class="totals-row" style="color: #16a34a;">
      <span>Diskon Voucher</span>
      <span>-Rp {{ number_format($order->discount_amount, 0, ',', '.') }}</span>
    </div>
    @endif
    <div class="totals-row border-top total">
      <span>TOTAL</span>
      <span>Rp {{ number_format($order->total, 0, ',', '.') }}</span>
    </div>
  </div>

  {{-- Paid stamp --}}
  @if($order->isPaid())
  <div class="paid-stamp">
    <span>LUNAS</span>
  </div>
  @endif

  {{-- Notes --}}
  @if($order->notes)
  <div style="margin-top: 20px; padding: 12px 14px; background: #fffbeb; border-left: 3px solid #f59e0b; border-radius: 4px; font-size: 11px; color: #92400e;">
    <strong>Catatan:</strong> {{ $order->notes }}
  </div>
  @endif

  {{-- Footer --}}
  <div class="footer">
    <p>Terima kasih telah berbelanja di <strong>TokoBuku</strong></p>
    <p>Invoice ini diterbitkan secara otomatis oleh sistem. Tidak memerlukan tanda tangan.</p>
    <p>Hubungi kami di contact@tokobuku.id untuk pertanyaan lebih lanjut.</p>
  </div>
</div>
</body>
</html>
