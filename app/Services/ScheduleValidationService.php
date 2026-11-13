<?php

namespace App\Services;

use App\Models\Showtime;

class ScheduleValidationService
{
    /**
     * Check if a proposed showtime has a conflict in the same studio.
     * Takes into account overlapping start and end times.
     */
    public function hasConflict(
        int $studioId,
        string $showDate,
        string $startTime,
        string $endTime,
        ?int $ignoreShowtimeId = null
    ): bool {
        return Showtime::where('studio_id', $studioId)
            ->whereDate('show_date', $showDate)
            ->where('is_active', true)
            ->when($ignoreShowtimeId, fn ($q) => $q->where('id', '!=', $ignoreShowtimeId))
            ->where(function ($query) use ($startTime, $endTime) {
                $query->where(function ($sub) use ($startTime, $endTime) {
                    $sub->where('start_time', '<', $endTime)
                        ->where('end_time', '>', $startTime);
                });
            })
            ->exists();
    }
}
