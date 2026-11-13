<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Seat extends Model
{
    use HasFactory;

    protected $fillable = [
        'studio_id',
        'row_label',
        'seat_number',
        'seat_type',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'seat_number' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Parent studio.
     */
    public function studio(): BelongsTo
    {
        return $this->belongsTo(Studio::class);
    }

    /**
     * Booking seats records for this seat.
     */
    public function bookingSeats(): HasMany
    {
        return $this->hasMany(BookingSeat::class);
    }

    /**
     * Tickets generated for this seat.
     */
    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class);
    }

    /**
     * Formatted label, e.g. "A10".
     */
    public function getSeatCode(): string
    {
        return $this->row_label.$this->seat_number;
    }
}
