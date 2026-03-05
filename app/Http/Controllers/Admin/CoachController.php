<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coach;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Illuminate\Support\Str;

class CoachController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $coaches = Coach::with('user')
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('specialization', 'like', "%{$search}%")
                    ->orWhere('contact_number', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($q) use ($search) {
                        $q->where('email', 'like', "%{$search}%");
                    });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Coaches/Index', [
            'coaches' => $coaches,
            'filters' => ['search' => $search],
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Coaches/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'name' => ['required', 'string', 'max:255'],
            'contact_number' => ['nullable', 'string', 'max:50'],
            'specialization' => ['nullable', 'string', 'max:255'],
            'experience_years' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        DB::transaction(function () use ($validated) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
            ]);

            // Assign Coach role to user -> assuming Spatie roles logic: findOrCreate
            $user->assignRole('coach');

            Coach::create([
                'user_id' => $user->id,
                'name' => $validated['name'],
                'contact_number' => $validated['contact_number'] ?? null,
                'specialization' => $validated['specialization'] ?? null,
                'experience_years' => $validated['experience_years'] ?? 0,
                'is_active' => $validated['is_active'] ?? true,
            ]);
        });

        return redirect()->route('admin.coaches.index')->with('success', 'Coach created successfully.');
    }

    public function edit(Coach $coach)
    {
        $coach->load('user');
        
        return Inertia::render('Admin/Coaches/Edit', [
            'coach' => $coach
        ]);
    }

    public function update(Request $request, Coach $coach)
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $coach->user_id],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'name' => ['required', 'string', 'max:255'],
            'contact_number' => ['nullable', 'string', 'max:50'],
            'specialization' => ['nullable', 'string', 'max:255'],
            'experience_years' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        DB::transaction(function () use ($validated, $coach) {
            $user = $coach->user;
            
            $userData = [
                'name' => $validated['name'],
                'email' => $validated['email'],
            ];

            if (!empty($validated['password'])) {
                $userData['password'] = Hash::make($validated['password']);
            }

            $user->update($userData);

            $coach->update([
                'name' => $validated['name'],
                'contact_number' => $validated['contact_number'] ?? null,
                'specialization' => $validated['specialization'] ?? null,
                'experience_years' => $validated['experience_years'] ?? 0,
                'is_active' => $validated['is_active'] ?? true,
            ]);
        });

        return redirect()->route('admin.coaches.index')->with('success', 'Coach updated successfully.');
    }

    public function destroy(Coach $coach)
    {
        DB::transaction(function () use ($coach) {
            $user = $coach->user;
            $coach->delete();
            if ($user && !$user->hasRole('admin')) { 
                // Only delete user if they are not also an admin, just to be safe.
                $user->delete();
            }
        });

        return redirect()->route('admin.coaches.index')->with('success', 'Coach deleted successfully.');
    }
}
