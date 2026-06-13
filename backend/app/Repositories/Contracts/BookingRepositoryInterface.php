<?php

namespace App\Repositories\Contracts;

use App\Models\Booking;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface BookingRepositoryInterface
{
    public function paginateForRoom(int $roomId, array $filters = []): LengthAwarePaginator;

    public function create(array $data): Booking;

    public function hasOverlap(int $roomId, string $start, string $end, ?int $excludeId = null): bool;
}
