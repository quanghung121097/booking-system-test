<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\Access\AuthorizationException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (ValidationException $e, Request $request): mixed {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'Validation failed.',
                    'errors'  => $e->errors(),
                ], 422);
            }

            return null;
        });

        $exceptions->render(function (AuthorizationException $e, Request $request): mixed {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => $e->getMessage() ?: 'This action is unauthorized.',
                ], 403);
            }

            return null;
        });

        $exceptions->render(function (\Throwable $e, Request $request): mixed {
            if ($request->is('api/*')) {
                $code = method_exists($e, 'getCode') && $e->getCode() >= 400
                    ? (int) $e->getCode()
                    : 500;

                return response()->json([
                    'message' => $e->getMessage() ?: 'Server error.',
                ], $code);
            }

            return null;
        });
    })->create();
