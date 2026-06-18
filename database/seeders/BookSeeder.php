<?php

namespace Database\Seeders;

use App\Models\Author;
use App\Models\Book;
use App\Models\Category;
use App\Models\Publisher;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BookSeeder extends Seeder
{
    public function run(): void
    {
        // Publishers
        $publishers = [
            ['name' => 'Gramedia Pustaka Utama', 'city' => 'Jakarta'],
            ['name' => 'Mizan', 'city' => 'Bandung'],
            ['name' => 'Erlangga', 'city' => 'Jakarta'],
            ['name' => 'Bentang Pustaka', 'city' => 'Yogyakarta'],
        ];

        foreach ($publishers as $p) {
            Publisher::firstOrCreate(['slug' => Str::slug($p['name'])], array_merge($p, ['slug' => Str::slug($p['name'])]));
        }

        // Authors
        $authors = [
            ['name' => 'Pramoedya Ananta Toer', 'nationality' => 'Indonesia'],
            ['name' => 'Andrea Hirata', 'nationality' => 'Indonesia'],
            ['name' => 'Tere Liye', 'nationality' => 'Indonesia'],
            ['name' => 'Raditya Dika', 'nationality' => 'Indonesia'],
            ['name' => 'Dee Lestari', 'nationality' => 'Indonesia'],
        ];

        foreach ($authors as $a) {
            Author::firstOrCreate(['slug' => Str::slug($a['name'])], array_merge($a, ['slug' => Str::slug($a['name'])]));
        }

        $fiksiCategory = Category::where('slug', 'fiksi')->first();
        $gpuPublisher = Publisher::where('slug', 'gramedia-pustaka-utama')->first();
        $andreahirata = Author::where('slug', 'andrea-hirata')->first();
        $tereliye = Author::where('slug', 'tere-liye')->first();

        if (!$fiksiCategory || !$gpuPublisher) return;

        $books = [
            [
                'title' => 'Laskar Pelangi',
                'isbn' => '978-979-22-2093-8',
                'synopsis' => '<p>Novel inspiratif tentang sepuluh anak Belitung yang gigih mengejar pendidikan di sekolah sederhana, menghadapi keterbatasan dengan semangat yang luar biasa.</p>',
                'price' => 89000,
                'stock' => 50,
                'pages' => 529,
                'weight' => 350,
                'is_featured' => true,
                'author_id' => $andreahirata?->id,
            ],
            [
                'title' => 'Bumi',
                'isbn' => '978-602-03-1126-1',
                'synopsis' => '<p>Raib tiba-tiba menghilang di hadapan seluruh teman sekelasnya. Tak ada yang tahu ke mana dia pergi, seolah ditelan bumi.</p>',
                'price' => 95000,
                'discount_percent' => 10,
                'stock' => 35,
                'pages' => 440,
                'weight' => 300,
                'is_featured' => true,
                'author_id' => $tereliye?->id,
            ],
            [
                'title' => 'Hujan',
                'isbn' => '978-602-03-2364-6',
                'synopsis' => '<p>Kisah dua anak manusia yang tumbuh bersama dalam sebuah dunia yang tidak mereka kenali, terus bertanya-tanya tentang takdir dan cinta.</p>',
                'price' => 88000,
                'stock' => 42,
                'pages' => 320,
                'weight' => 250,
                'author_id' => $tereliye?->id,
            ],
            [
                'title' => 'Perahu Kertas',
                'isbn' => '978-979-22-4681-5',
                'synopsis' => '<p>Dua orang anak manusia dalam petualangan menakjubkan, saling menemukan dan kehilangan, dipertemukan kembali oleh cinta.</p>',
                'price' => 79000,
                'discount_percent' => 15,
                'discount_until' => now()->addDays(30)->toDateString(),
                'stock' => 28,
                'pages' => 344,
                'weight' => 270,
            ],
            [
                'title' => 'Atomic Habits',
                'isbn' => '978-602-481-234-5',
                'synopsis' => '<p>Buku panduan perubahan kebiasaan kecil yang menghasilkan perbedaan luar biasa dalam hidup Anda.</p>',
                'price' => 105000,
                'book_type' => 'both',
                'digital_price' => 65000,
                'stock' => 60,
                'pages' => 320,
                'weight' => 300,
                'is_featured' => true,
            ],
        ];

        foreach ($books as $bookData) {
            $authorId = $bookData['author_id'] ?? null;
            unset($bookData['author_id']);

            $slug = Str::slug($bookData['title']);
            $book = Book::firstOrCreate(
                ['slug' => $slug],
                array_merge($bookData, [
                    'slug' => $slug,
                    'category_id' => $fiksiCategory->id,
                    'publisher_id' => $gpuPublisher->id,
                    'book_type' => $bookData['book_type'] ?? 'physical',
                    'language' => 'Indonesia',
                    'is_active' => true,
                    'cover_image' => 'https://placehold.co/300x420/3b82f6/white?text=' . urlencode(Str::limit($bookData['title'], 20)),
                ])
            );

            if ($authorId && !$book->authors()->where('author_id', $authorId)->exists()) {
                $book->authors()->attach($authorId, ['role' => 'author']);
            }
        }
    }
}
