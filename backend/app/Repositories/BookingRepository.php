<?php

namespace App\Repositories;

use App\Models\Booking;
use App\Repositories\Contracts\BookingRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class BookingRepository implements BookingRepositoryInterface
{
    public function paginateForRoom(int $roomId, array $filters = []): LengthAwarePaginator
    {
        $query = Booking::where('room_id', $roomId)
            ->with('room')
            ->orderBy('start_time');

        if (! empty($filters['user_name'])) {
            $query->where('user_name', 'like', '%'.$filters['user_name'].'%');
        }

        if (! empty($filters['from'])) {
            $query->where('end_time', '>=', $filters['from']);
        }

        if (! empty($filters['to'])) {
            $query->where('start_time', '<=', $filters['to']);
        }

        $perPage = min(max((int) ($filters['per_page'] ?? 10), 1), 50);
        $page = max((int) ($filters['page'] ?? 1), 1);

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    public function create(array $data): Booking
    {
        return Booking::create($data);
    }

    public function hasOverlap(int $roomId, string $start, string $end, ?int $excludeId = null): bool
    {
        return Booking::where('room_id', $roomId)
            ->where('start_time', '<', $end)
            ->where('end_time', '>', $start)
            ->when($excludeId, fn ($q, $id) => $q->where('id', '!=', $id))
            ->exists();
    }
}
