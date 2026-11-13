<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Studio extends Model
{
    use HasFactory;

    protected $fillable = [
        'cinema_id',
        'name',
        'type',
        'total_seats',
        'price_multiplier',
    ];

    protected $appends = [
        'studio_type',
    ];

    public function getStudioTypeAttribute(): string
    {
        return $this->attributes['type'] ?? 'regular';
    }

    protected function casts(): array
    {
        return [
            'total_seats' => 'integer',
            'price_multiplier' => 'float',
        ];
    }

    /**
     * Parent cinema.
     */
    public function cinema(): BelongsTo
    {
        return $this->belongsTo(Cinema::class);
    }

    /**
     * Physical seats in this studio.
     */
    public function seats(): HasMany
    {
        return $this->hasMany(Seat::class);
    }

    /**
     * Showtimes in this studio.
     */
    public function showtimes(): HasMany
    {
        return $this->hasMany(Showtime::class);
    }
}
