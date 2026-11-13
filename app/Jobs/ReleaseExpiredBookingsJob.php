<?php

namespace App\Jobs;

use App\Services\BookingService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ReleaseExpiredBookingsJob implements ShouldQueue
{
    use Queueable;

    /**
     * Execute the job to release stale seat locks.
     */
    public function handle(BookingService $bookingService): void
    {
        $bookingService->releaseExpiredSeats();
    }
}
