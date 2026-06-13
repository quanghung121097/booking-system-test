<?php

namespace App\Services;

use App\Models\Booking;
use App\Repositories\Contracts\BookingRepositoryInterface;

class BookingService
{
    public function __construct(
        private readonly BookingRepositoryInterface $bookingRepository,
    ) {}

    public function create(array $data): Booking
    {
        if ($this->bookingRepository->hasOverlap(
            $data['room_id'],
            $data['start_time'],
            $data['end_time'],
        )) {
            throw new \DomainException('This time slot overlaps with an existing booking.', 422);
        }

        return $this->bookingRepository->create($data);
    }
}
