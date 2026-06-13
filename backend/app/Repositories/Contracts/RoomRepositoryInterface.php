<?php

namespace App\Repositories\Contracts;

use App\Models\Room;
use Illuminate\Database\Eloquent\Collection;

interface RoomRepositoryInterface
{
    public function allWithBookingCount(): Collection;

    public function findById(int $id): ?Room;
}
