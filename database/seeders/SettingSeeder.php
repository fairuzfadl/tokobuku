<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            ['key' => 'site_name', 'value' => 'TokoBuku', 'group' => 'general'],
            ['key' => 'site_tagline', 'value' => 'Platform Jual Beli Buku Online', 'group' => 'general'],
            ['key' => 'contact_email', 'value' => 'contact@tokobuku.id', 'group' => 'general'],
            ['key' => 'contact_phone', 'value' => '+62 21 0000-0000', 'group' => 'general'],
            ['key' => 'midtrans_env', 'value' => 'sandbox', 'group' => 'payment'],
            ['key' => 'midtrans_snap_url', 'value' => 'https://app.sandbox.midtrans.com/snap/snap.js', 'group' => 'payment'],
            ['key' => 'midtrans_client_key', 'value' => env('MIDTRANS_CLIENT_KEY', ''), 'group' => 'payment'],
            ['key' => 'free_shipping_threshold', 'value' => '0', 'group' => 'shipping'],
            ['key' => 'flat_shipping_cost', 'value' => '15000', 'group' => 'shipping'],
            ['key' => 'low_stock_threshold', 'value' => '5', 'group' => 'inventory'],
            ['key' => 'order_expiry_hours', 'value' => '24', 'group' => 'order'],
            ['key' => 'review_auto_approve', 'value' => '1', 'group' => 'review'],
        ];

        foreach ($settings as $s) {
            Setting::firstOrCreate(['key' => $s['key']], $s);
        }
    }
}
