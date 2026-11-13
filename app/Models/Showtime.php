<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;

class Showtime extends Model
{
    use HasFactory;

    protected $fillable = [
        'movie_id',
        'studio_id',
        'show_date',
        'start_time',
        'end_time',
        'base_price',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'show_date' => 'date',
            'base_price' => 'float',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Associated movie.
     */
    public function movie(): BelongsTo
    {
        return $this->belongsTo(Movie::class);
    }

    /**
     * Associated studio.
     */
    public function studio(): BelongsTo
    {
        return $this->belongsTo(Studio::class);
    }

    /**
     * Associated cinema through studio.
     */
    public function cinema(): HasOneThrough
    {
        return $this->hasOneThrough(Cinema::class, Studio::class, 'id', 'id', 'studio_id', 'cinema_id');
    }

    /**
     * Bookings for this showtime.
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * Seat reservations for this showtime.
     */
    public function bookingSeats(): HasMany
    {
        return $this->hasMany(BookingSeat::class);
    }
}
