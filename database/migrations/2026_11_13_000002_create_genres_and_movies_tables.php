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
        Schema::create('genres', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->unique();
            $table->string('slug', 100)->unique();
            $table->timestamps();
        });

        Schema::create('movies', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('synopsis');
            $table->unsignedInteger('duration_minutes');
            $table->enum('rating_age', ['SU', '13+', '17+', '21+'])->default('13+');
            $table->string('director');
            $table->text('cast');
            $table->string('language', 100)->default('Indonesia');
            $table->string('subtitle', 100)->default('Indonesia');
            $table->string('trailer_url')->nullable();
            $table->string('poster_path');
            $table->string('banner_path')->nullable();
            $table->date('release_date');
            $table->enum('status', ['now_showing', 'upcoming', 'archived'])->default('now_showing')->index();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('movie_genres', function (Blueprint $table) {
            $table->foreignId('movie_id')->constrained('movies')->cascadeOnDelete();
            $table->foreignId('genre_id')->constrained('genres')->cascadeOnDelete();
            $table->primary(['movie_id', 'genre_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('movie_genres');
        Schema::dropIfExists('movies');
        Schema::dropIfExists('genres');
    }
};
