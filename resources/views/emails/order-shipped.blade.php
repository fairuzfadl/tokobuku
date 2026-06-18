<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { margin: 0; padding: 0; background: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  .wrapper { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
  .header { background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); padding: 32px; text-align: center; }
  .header h1 { color: #fff; font-size: 24px; font-weight: 800; margin: 8px 0 0; }
  .header p { color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 14px; }
  .header-icon { font-size: 40px; margin-bottom: 8px; }
  .body { padding: 32px; }
  .tracking-box { background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
  .tracking-box h3 { font-size: 12px; font-weight: 600; color: #7c3aed; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 10px; }
  .tracking-number { font-size: 22px; font-weight: 800; color: #5b21b6; font-family: monospace; letter-spacing: 1px; }
  .courier { font-size: 14px; color: #6b7280; margin-top: 4px; }
  .info-row { display: flex; justify-content: space-between; padding: 10px 0; font-size: 14px; border-bottom: 1px solid #f3f4f6; }
  .info-row span:first-child { color: #6b7280; }
  .info-row span:last-child { font-weight: 600; color: #111827; }
  .cta { text-align: center; margin: 28px 0; }
  .cta a { display: inline-block; background: #7c3aed; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 15px; }
  .footer { background: #f9fafb; padding: 20px 32px; text-align: center; color: #9ca3af; font-size: 12px; line-height: 1.8; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <div class="header-icon">📦</div>
    <h1>Pesanan Dikirim!</h1>
    <p>Paket sedang dalam perjalanan menuju kamu</p>
  </div>
  <div class="body">
    <p style="color: #374151; font-size: 15px; margin-bottom: 20px;">Halo, <strong>{{ $order->user->name }}</strong>!</p>
    <p style="color: #6b7280; font-size: 14px; margin-bottom: 24px;">Kabar baik! Pesananmu telah dikirim oleh tim kami. Berikut informasi pengirimannya:</p>

    @if($order->tracking_number)
    <div class="tracking-box">
      <h3>Nomor Resi</h3>
      <div class="tracking-number">{{ $order->tracking_number }}</div>
      @if($order->shipping_courier)
      <div class="courier">Kurir: <strong>{{ strtoupper($order->shipping_courier) }}</strong></div>
      @endif
    </div>
    @endif

    <div class="info-row"><span>No. Pesanan</span><span style="font-family: monospace">{{ $order->order_number }}</span></div>
    <div class="info-row"><span>Alamat Tujuan</span><span>{{ $order->address?->city }}, {{ $order->address?->province }}</span></div>
    <div class="info-row" style="border: 0"><span>Tanggal Pengiriman</span><span>{{ now()->format('d F Y') }}</span></div>

    <div class="cta">
      <a href="{{ config('app.url') }}/pesanan/{{ $order->order_number }}">Lacak Pesanan</a>
    </div>

    <p style="color: #9ca3af; font-size: 13px; text-align: center">Mohon konfirmasi pesanan diterima setelah paket sampai di tanganmu.</p>
  </div>
  <div class="footer">
    <p><strong>TokoBuku</strong> — Platform Jual Beli Buku Online</p>
    <p>Email ini dikirim otomatis, mohon tidak membalas email ini.</p>
  </div>
</div>
</body>
</html>
