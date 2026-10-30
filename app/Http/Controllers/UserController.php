<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use App\Services\ActivityLogger;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        return Inertia::render('Users/Index', [
            'users' => User::orderBy('first_name')->get()
        ]);
    }

    public function create()
    {
        return Inertia::render('Users/Create');
    }

    public function store(StoreUserRequest $request)
    {
        $validated = $request->validated();
        $validated['password'] = bcrypt($validated['password']);
        $validated['username'] = $validated['username'] ?? strtolower($validated['first_name'] . '.' . $validated['last_name']);

        $user = User::create($validated);
        $this->syncSuperadmin($user);

        ActivityLogger::log('user.created', sprintf('Created user %s (#%d)', $user->email, $user->id));

        return redirect()->back()->with('success', 'User created successfully');
    }

    public function show(User $user)
    {
        $this->authorize('view', $user);

        return Inertia::render('Users/Show', [
            'user' => $user->loadCount(['projects', 'expenses', 'photos', 'documents']),
            'can' => ['update' => auth()->user()->can('update', $user)],
        ]);
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $this->authorize('update', $user);

        $user->update($request->validated());
        $this->syncSuperadmin($user);

        return redirect()->back()->with('success', 'User updated successfully');
    }

    public function edit(User $user)
    {
        return Inertia::render('Users/Edit', [
            'user' => $user,
        ]);
    }

    public function destroy(User $user)
    {
        $this->authorize('delete', $user);

        ActivityLogger::log('user.deleted', sprintf('Deleted user %s (#%d)', $user->email, $user->id));

        $user->delete();
        return redirect()->back()->with('success', 'User deleted successfully');
    }

    /** An admin (users.role, until it is dropped) is a superadmin, and the other way round. */
    private function syncSuperadmin(User $user): void
    {
        $user->forceFill(['is_superadmin' => $user->role === 'admin'])->save();
    }
}
