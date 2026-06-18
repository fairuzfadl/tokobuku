<?php

namespace Database\Seeders;

use App\Models\Banner;
use Illuminate\Database\Seeder;

class BannerSeeder extends Seeder
{
    public function run(): void
    {
        $banners = [
            [
                'title' => 'Buku Terbaik untuk Hari Ini',
                'subtitle' => 'Temukan ribuan judul buku pilihan dengan harga terbaik',
                'image' => 'https://placehold.co/1200x400/3b82f6/white?text=TokoBuku+Banner',
                'link' => '/katalog',
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'title' => 'Promo Akhir Tahun',
                'subtitle' => 'Diskon hingga 50% untuk buku pilihan!',
                'image' => 'https://placehold.co/1200x400/7c3aed/white?text=Promo+50%25',
                'link' => '/katalog?sort=discount',
                'sort_order' => 2,
                'is_active' => true,
            ],
        ];

        foreach ($banners as $b) {
            Banner::firstOrCreate(['title' => $b['title']], $b);
        }
    }
}
