<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\RoomResource;
use App\Models\Room;
use App\Repositories\Contracts\RoomRepositoryInterface;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class RoomController extends Controller
{
    public function __construct(
        private readonly RoomRepositoryInterface $roomRepository,
    ) {}

    public function index(): AnonymousResourceCollection
    {
        return RoomResource::collection($this->roomRepository->allWithBookingCount());
    }

    public function show(Room $room): RoomResource
    {
        return RoomResource::make($room->loadCount('bookings'));
    }
}
