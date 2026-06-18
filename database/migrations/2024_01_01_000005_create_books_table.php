<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('books', function (Blueprint $table) {
            $table->id();
            $table->foreignId('publisher_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title', 500);
            $table->string('slug', 520)->unique();
            $table->string('isbn', 20)->nullable()->unique();
            $table->longText('synopsis')->nullable();
            $table->string('cover_image', 500)->nullable();
            $table->enum('book_type', ['physical', 'digital', 'both'])->default('physical');
            $table->string('language', 50)->default('Indonesia');
            $table->smallInteger('pages')->unsigned()->nullable();
            $table->smallInteger('weight')->unsigned()->nullable()->comment('gram');
            $table->decimal('width', 5, 2)->nullable()->comment('cm');
            $table->decimal('height', 5, 2)->nullable()->comment('cm');
            $table->decimal('thickness', 5, 2)->nullable()->comment('cm');
            $table->string('edition', 50)->nullable();
            $table->date('published_at')->nullable();
            $table->decimal('price', 12, 2);
            $table->decimal('digital_price', 12, 2)->nullable();
            $table->tinyInteger('discount_percent')->unsigned()->default(0);
            $table->timestamp('discount_until')->nullable();
            $table->integer('stock')->unsigned()->default(0);
            $table->string('digital_file', 500)->nullable();
            $table->decimal('rating_avg', 3, 2)->default(0.00);
            $table->integer('rating_count')->unsigned()->default(0);
            $table->integer('sold_count')->unsigned()->default(0);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->string('meta_title', 160)->nullable();
            $table->string('meta_description', 320)->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['is_active', 'is_featured']);
            $table->index(['category_id', 'is_active']);
            $table->index(['created_at']);
        });

        // FULLTEXT index untuk pencarian
        \DB::statement('ALTER TABLE books ADD FULLTEXT fulltext_books (title, synopsis)');
    }

    public function down(): void
    {
        Schema::dropIfExists('books');
    }
};
