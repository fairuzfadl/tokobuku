<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { margin: 0; padding: 0; background: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  .wrapper { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
  .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 32px; text-align: center; }
  .header h1 { color: #fff; font-size: 26px; font-weight: 800; margin: 0; }
  .header p { color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 14px; }
  .body { padding: 32px; }
  .greeting { font-size: 16px; color: #374151; margin-bottom: 20px; }
  .order-box { background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
  .order-box h2 { font-size: 14px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 14px; }
  .order-meta { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
  .order-meta span:first-child { color: #6b7280; }
  .order-meta span:last-child { font-weight: 600; color: #111827; }
  .items-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  .items-table th { text-align: left; padding: 10px 0; font-size: 12px; color: #6b7280; border-bottom: 1px solid #e5e7eb; }
  .items-table td { padding: 12px 0; font-size: 14px; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
  .items-table td:last-child { text-align: right; font-weight: 600; }
  .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
  .total-row.grand { font-size: 17px; font-weight: 700; color: #3b82f6; border-top: 2px solid #e5e7eb; padding-top: 12px; margin-top: 6px; }
  .cta { text-align: center; margin: 28px 0; }
  .cta a { display: inline-block; background: #3b82f6; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 15px; }
  .footer { background: #f9fafb; padding: 20px 32px; text-align: center; color: #9ca3af; font-size: 12px; line-height: 1.8; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <h1>TokoBuku</h1>
    <p>Pesananmu telah diterima!</p>
  </div>
  <div class="body">
    <p class="greeting">Halo, <strong>{{ $order->user->name }}</strong>!</p>
    <p style="color: #6b7280; font-size: 14px; margin-bottom: 24px;">Terima kasih telah berbelanja di TokoBuku. Kami telah menerima pesananmu dan sedang menunggu pembayaran.</p>

    <div class="order-box">
      <h2>Detail Pesanan</h2>
      <div class="order-meta"><span>No. Pesanan</span><span style="font-family: monospace">{{ $order->order_number }}</span></div>
      <div class="order-meta"><span>Tanggal</span><span>{{ $order->created_at->format('d F Y, H:i') }} WIB</span></div>
      <div class="order-meta"><span>Status</span><span style="color: #f59e0b">Menunggu Pembayaran</span></div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th>Buku</th>
          <th style="text-align: center">Qty</th>
          <th style="text-align: right">Harga</th>
        </tr>
      </thead>
      <tbody>
        @foreach($order->items as $item)
        <tr>
          <td>
            <div style="font-weight: 600; color: #111827">{{ $item->book_title }}</div>
            <div style="font-size: 12px; color: #9ca3af; margin-top: 2px">{{ $item->book_type === 'digital' ? 'Buku Digital' : 'Buku Fisik' }}</div>
          </td>
          <td style="text-align: center">{{ $item->quantity }}</td>
          <td>Rp {{ number_format($item->subtotal, 0, ',', '.') }}</td>
        </tr>
        @endforeach
      </tbody>
    </table>

    <div class="total-row"><span style="color: #6b7280">Subtotal</span><span>Rp {{ number_format($order->subtotal, 0, ',', '.') }}</span></div>
    <div class="total-row"><span style="color: #6b7280">Ongkos Kirim</span><span>Rp {{ number_format($order->shipping_cost, 0, ',', '.') }}</span></div>
    @if($order->discount_amount > 0)
    <div class="total-row" style="color: #16a34a"><span>Diskon Voucher</span><span>-Rp {{ number_format($order->discount_amount, 0, ',', '.') }}</span></div>
    @endif
    <div class="total-row grand"><span>Total Pembayaran</span><span>Rp {{ number_format($order->total, 0, ',', '.') }}</span></div>

    <div class="cta">
      <a href="{{ config('app.url') }}/pesanan/{{ $order->order_number }}">Selesaikan Pembayaran</a>
    </div>

    <p style="color: #9ca3af; font-size: 12px; text-align: center">Pesanan akan otomatis dibatalkan jika belum dibayar dalam 24 jam.</p>
  </div>
  <div class="footer">
    <p><strong>TokoBuku</strong> — Platform Jual Beli Buku Online</p>
    <p>Email ini dikirim otomatis, mohon tidak membalas email ini.</p>
    <p>Pertanyaan? Hubungi kami di contact@tokobuku.id</p>
  </div>
</div>
</body>
</html>
