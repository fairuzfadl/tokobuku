<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { margin: 0; padding: 0; background: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  .wrapper { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
  .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 32px; text-align: center; }
  .checkmark { width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; font-size: 30px; }
  .header h1 { color: #fff; font-size: 24px; font-weight: 800; margin: 0; }
  .header p { color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 14px; }
  .body { padding: 32px; }
  .success-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center; }
  .success-box p { color: #166534; font-size: 14px; margin: 4px 0; }
  .success-box .amount { font-size: 28px; font-weight: 800; color: #15803d; }
  .info-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; border-bottom: 1px solid #f3f4f6; }
  .info-row span:first-child { color: #6b7280; }
  .info-row span:last-child { font-weight: 600; color: #111827; }
  .steps { margin: 24px 0; }
  .step { display: flex; gap: 16px; margin-bottom: 16px; align-items: flex-start; }
  .step-num { width: 32px; height: 32px; background: #3b82f6; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; flex-shrink: 0; }
  .step-text h3 { font-size: 14px; font-weight: 600; color: #111827; margin: 0 0 2px; }
  .step-text p { font-size: 13px; color: #6b7280; margin: 0; }
  .cta { text-align: center; margin: 28px 0; }
  .cta a { display: inline-block; background: #059669; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 15px; }
  .footer { background: #f9fafb; padding: 20px 32px; text-align: center; color: #9ca3af; font-size: 12px; line-height: 1.8; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <div class="checkmark">✓</div>
    <h1>Pembayaran Berhasil!</h1>
    <p>Pesananmu sudah kami terima</p>
  </div>
  <div class="body">
    <p style="color: #374151; font-size: 15px; margin-bottom: 20px;">Halo, <strong>{{ $order->user->name }}</strong>!</p>

    <div class="success-box">
      <p>Total Pembayaran</p>
      <div class="amount">Rp {{ number_format($order->total, 0, ',', '.') }}</div>
      <p>No. Pesanan: <strong style="font-family: monospace">{{ $order->order_number }}</strong></p>
    </div>

    <div class="info-row"><span>Metode Pembayaran</span><span>{{ str_replace('_', ' ', $order->payment?->payment_type ?? '-') }}</span></div>
    <div class="info-row"><span>Waktu Pembayaran</span><span>{{ $order->payment?->paid_at ? \Carbon\Carbon::parse($order->payment->paid_at)->format('d F Y, H:i') . ' WIB' : '-' }}</span></div>
    <div class="info-row" style="border: 0"><span>Status Pesanan</span><span style="color: #059669">Pembayaran Diterima</span></div>

    <div class="steps" style="margin-top: 28px;">
      <h3 style="font-size: 15px; font-weight: 700; color: #111827; margin-bottom: 16px;">Apa yang terjadi selanjutnya?</h3>
      <div class="step">
        <div class="step-num">1</div>
        <div class="step-text">
          <h3>Pesanan Diproses</h3>
          <p>Tim kami akan memproses pesananmu dalam 1×24 jam kerja</p>
        </div>
      </div>
      <div class="step">
        <div class="step-num">2</div>
        <div class="step-text">
          <h3>Dikirim ke Alamatmu</h3>
          <p>Kami akan mengirimkan nomor resi setelah paket dikirim</p>
        </div>
      </div>
      <div class="step">
        <div class="step-num">3</div>
        <div class="step-text">
          <h3>Pesanan Tiba</h3>
          <p>Jangan lupa konfirmasi setelah pesanan diterima!</p>
        </div>
      </div>
    </div>

    <div class="cta">
      <a href="{{ config('app.url') }}/pesanan/{{ $order->order_number }}">Lihat Status Pesanan</a>
    </div>
  </div>
  <div class="footer">
    <p><strong>TokoBuku</strong> — Platform Jual Beli Buku Online</p>
    <p>Email ini dikirim otomatis, mohon tidak membalas email ini.</p>
    <p>Pertanyaan? Hubungi kami di contact@tokobuku.id</p>
  </div>
</div>
</body>
</html>
