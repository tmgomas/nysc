<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
        
        // Register Spatie Permission middleware aliases
        $middleware->alias([
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Handle custom payment exceptions
        $exceptions->renderable(function (\App\Exceptions\Payment\InvalidPaymentAmountException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => $e->getMessage(),
                    'error' => 'invalid_payment_amount'
                ], 422);
            }
            
            return back()->withErrors(['amount' => $e->getMessage()]);
        });

        $exceptions->renderable(function (\App\Exceptions\Payment\PaymentNotFoundException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => $e->getMessage(),
                    'error' => 'payment_not_found'
                ], 404);
            }
            
            return back()->withErrors(['payment' => $e->getMessage()]);
        });

        // Handle custom member exceptions
        $exceptions->renderable(function (\App\Exceptions\Member\MemberNotFoundException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => $e->getMessage(),
                    'error' => 'member_not_found'
                ], 404);
            }
            
            return redirect()->route('admin.members.index')
                ->withErrors(['member' => $e->getMessage()]);
        });

        $exceptions->renderable(function (\App\Exceptions\Member\InvalidMemberStatusException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => $e->getMessage(),
                    'error' => 'invalid_member_status'
                ], 403);
            }
            
            return back()->withErrors(['status' => $e->getMessage()]);
        });

        // Handle custom sport exceptions
        $exceptions->renderable(function (\App\Exceptions\Sport\SportNotFoundException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => $e->getMessage(),
                    'error' => 'sport_not_found'
                ], 404);
            }
            
            return back()->withErrors(['sport' => $e->getMessage()]);
        });

        $exceptions->renderable(function (\App\Exceptions\Sport\SportCapacityExceededException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => $e->getMessage(),
                    'error' => 'sport_capacity_exceeded'
                ], 422);
            }
            
            return back()->withErrors(['sport' => $e->getMessage()]);
        });
    })->create();

