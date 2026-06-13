<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\IndexBookingsRequest;
use App\Http\Requests\StoreBookingRequest;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use App\Models\Room;
use App\Repositories\Contracts\BookingRepositoryInterface;
use App\Services\BookingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class BookingController extends Controller
{
    public function __construct(
        private readonly BookingService $bookingService,
        private readonly BookingRepositoryInterface $bookingRepository,
    ) {}

    public function index(IndexBookingsRequest $request, Room $room): AnonymousResourceCollection
    {
        $paginator = $this->bookingRepository->paginateForRoom(
            $room->id,
            $request->validated(),
        );

        return BookingResource::collection($paginator);
    }

    public function store(StoreBookingRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();
            $data['user_id'] = $request->user()->id;

            $booking = $this->bookingService->create($data);

            return BookingResource::make($booking->load('room'))
                ->response()
                ->setStatusCode(201);
        } catch (\DomainException $e) {
            $message = $e->getMessage();

            return response()->json([
                'message' => $message,
                'code'    => 'booking_overlap',
                'errors'  => [
                    'start_time' => [$message],
                    'end_time'   => [$message],
                ],
            ], 422);
        }
    }

    public function destroy(Booking $booking): Response
    {
        $this->authorize('delete', $booking);

        $booking->delete();

        return response()->noContent();
    }
}
