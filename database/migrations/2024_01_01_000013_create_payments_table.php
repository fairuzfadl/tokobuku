<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('midtrans_order_id', 50)->unique();
            $table->string('snap_token', 500)->nullable();
            $table->string('transaction_id', 100)->nullable();
            $table->string('payment_type', 50)->nullable();
            $table->enum('payment_status', [
                'pending', 'capture', 'settlement', 'deny', 'cancel', 'expire', 'refund'
            ])->default('pending');
            $table->decimal('gross_amount', 12, 2);
            $table->json('midtrans_response')->nullable();
            $table->string('va_number', 50)->nullable();
            $table->timestamp('expired_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
            $table->index('order_id');
            $table->index('payment_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
