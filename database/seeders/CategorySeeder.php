<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Fiksi', 'sort_order' => 1, 'children' => ['Novel', 'Cerpen', 'Fantasi', 'Sci-Fi', 'Thriller']],
            ['name' => 'Non-Fiksi', 'sort_order' => 2, 'children' => ['Biografi', 'Sejarah', 'Sains', 'Politik', 'Ekonomi']],
            ['name' => 'Pendidikan', 'sort_order' => 3, 'children' => ['SD', 'SMP', 'SMA', 'Kuliah', 'Umum']],
            ['name' => 'Self-Help', 'sort_order' => 4, 'children' => ['Motivasi', 'Produktivitas', 'Keuangan Pribadi']],
            ['name' => 'Agama & Spiritualitas', 'sort_order' => 5, 'children' => ['Islam', 'Kristen', 'Umum']],
            ['name' => 'Anak & Remaja', 'sort_order' => 6, 'children' => ['Buku Anak', 'Komik', 'Young Adult']],
            ['name' => 'Teknologi', 'sort_order' => 7, 'children' => ['Pemrograman', 'Desain', 'Bisnis Digital']],
            ['name' => 'Seni & Budaya', 'sort_order' => 8, 'children' => []],
        ];

        foreach ($categories as $catData) {
            $parent = Category::firstOrCreate(
                ['slug' => Str::slug($catData['name'])],
                ['name' => $catData['name'], 'sort_order' => $catData['sort_order'], 'is_active' => true]
            );

            foreach ($catData['children'] as $i => $childName) {
                Category::firstOrCreate(
                    ['slug' => Str::slug($childName)],
                    ['name' => $childName, 'parent_id' => $parent->id, 'sort_order' => $i + 1, 'is_active' => true]
                );
            }
        }
    }
}
