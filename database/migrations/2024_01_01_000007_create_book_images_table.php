<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('book_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('book_id')->constrained()->cascadeOnDelete();
            $table->string('image_url', 500);
            $table->tinyInteger('sort_order')->unsigned()->default(0);
            $table->timestamp('created_at')->nullable();
            $table->index('book_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('book_images');
    }
};
