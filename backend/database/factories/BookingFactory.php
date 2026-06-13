<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\Room;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Booking>
 */
class BookingFactory extends Factory
{
    protected $model = Booking::class;

    public function definition(): array
    {
        $start = now()->addDays(rand(1, 7))->setMinutes(0)->setSeconds(0)->addHours(rand(8, 17));
        $end   = (clone $start)->addHours(rand(1, 3));

        return [
            'room_id'    => Room::factory(),
            'user_id'    => 1,
            'user_name'  => fake()->name(),
            'start_time' => $start,
            'end_time'   => $end,
        ];
    }
}
