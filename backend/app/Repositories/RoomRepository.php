<?php

namespace App\Repositories;

use App\Models\Room;
use App\Repositories\Contracts\RoomRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class RoomRepository implements RoomRepositoryInterface
{
    public function allWithBookingCount(): Collection
    {
        return Room::withCount('bookings')->get();
    }

    public function findById(int $id): ?Room
    {
        return Room::find($id);
    }
}
