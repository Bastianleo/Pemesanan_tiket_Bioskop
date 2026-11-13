<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('cinemas', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('city', 100)->index();
            $table->text('address');
            $table->string('phone', 50)->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('studios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cinema_id')->constrained('cinemas')->cascadeOnDelete();
            $table->string('name', 100);
            $table->enum('type', ['regular', 'deluxe', 'imax', 'vip_premiere'])->default('regular');
            $table->unsignedInteger('total_seats')->default(0);
            $table->decimal('price_multiplier', 4, 2)->default(1.00);
            $table->timestamps();
        });

        Schema::create('seats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('studio_id')->constrained('studios')->cascadeOnDelete();
            $table->string('row_label', 2);
            $table->unsignedSmallInteger('seat_number');
            $table->enum('seat_type', ['regular', 'vip', 'couple'])->default('regular');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['studio_id', 'row_label', 'seat_number'], 'seats_studio_row_number_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('seats');
        Schema::dropIfExists('studios');
        Schema::dropIfExists('cinemas');
    }
};
