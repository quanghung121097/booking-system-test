<?php

namespace Database\Factories;

use App\Models\Room;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Room>
 */
class RoomFactory extends Factory
{
    protected $model = Room::class;

    public function definition(): array
    {
        return [
            'name'     => 'Room ' . fake()->unique()->numberBetween(1, 50),
            'capacity' => fake()->numberBetween(2, 20),
        ];
    }
}
