<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'room_id'    => $this->room_id,
            'user_name'  => $this->user_name,
            'start_time' => $this->start_time->toIso8601String(),
            'end_time'   => $this->end_time->toIso8601String(),
            'room'       => RoomResource::make($this->whenLoaded('room')),
        ];
    }
}
