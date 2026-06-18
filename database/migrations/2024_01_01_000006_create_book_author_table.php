<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('book_author', function (Blueprint $table) {
            $table->foreignId('book_id')->constrained()->cascadeOnDelete();
            $table->foreignId('author_id')->constrained()->cascadeOnDelete();
            $table->enum('role', ['author', 'translator', 'editor', 'illustrator'])->default('author');
            $table->primary(['book_id', 'author_id', 'role']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('book_author');
    }
};
