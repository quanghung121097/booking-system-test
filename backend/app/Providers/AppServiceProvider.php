<?php

namespace App\Providers;

use App\Repositories\BookingRepository;
use App\Repositories\Contracts\BookingRepositoryInterface;
use App\Repositories\Contracts\RoomRepositoryInterface;
use App\Repositories\RoomRepository;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(BookingRepositoryInterface::class, BookingRepository::class);
        $this->app->bind(RoomRepositoryInterface::class, RoomRepository::class);
    }

    public function boot(): void
    {
        RateLimiter::for('api', function (Request $request): Limit {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });
    }
}
