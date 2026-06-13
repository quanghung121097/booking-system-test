<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Room;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /** @var list<array{name: string, capacity: int}> */
    private const ROOMS = [
        ['name' => 'Room Alpha', 'capacity' => 4],
        ['name' => 'Room Beta', 'capacity' => 6],
        ['name' => 'Room Gamma', 'capacity' => 8],
        ['name' => 'Room Delta', 'capacity' => 10],
        ['name' => 'Room Epsilon', 'capacity' => 12],
        ['name' => 'Room Zeta', 'capacity' => 6],
        ['name' => 'Room Eta', 'capacity' => 8],
        ['name' => 'Room Theta', 'capacity' => 20],
    ];

    public function run(): void
    {
        $user = User::updateOrCreate(
            ['email' => 'test@example.com'],
            [
                'name'     => 'Test User',
                'password' => Hash::make('password'),
            ],
        );

        $rooms = collect(self::ROOMS)->map(
            fn (array $room) => Room::updateOrCreate(
                ['name' => $room['name']],
                ['capacity' => $room['capacity']],
            ),
        );

        $rooms->each(function (Room $room, int $index) use ($user): void {
            if ($room->bookings()->exists()) {
                return;
            }

            $baseDay = now()->addDays($index + 1)->startOfDay();

            $slots = [
                [$baseDay->copy()->setTime(9, 0), $baseDay->copy()->setTime(10, 0)],
                [$baseDay->copy()->setTime(14, 0), $baseDay->copy()->setTime(16, 0)],
            ];

            if ($index % 2 === 0) {
                $slots[] = [$baseDay->copy()->setTime(17, 0), $baseDay->copy()->setTime(18, 0)];
            }

            foreach ($slots as [$start, $end]) {
                Booking::create([
                    'room_id'    => $room->id,
                    'user_id'    => $user->id,
                    'user_name'  => $user->name,
                    'start_time' => $start,
                    'end_time'   => $end,
                ]);
            }
        });
    }
}
