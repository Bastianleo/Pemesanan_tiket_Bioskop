<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Cinema;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CinemaController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->query('search');

        $cinemas = Cinema::withCount('studios')
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/cinemas/index', [
            'cinemas' => $cinemas,
            'filters' => ['search' => $search],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'address' => ['required', 'string'],
            'phone' => ['nullable', 'string', 'max:50'],
            'is_active' => ['boolean'],
        ]);

        $slug = Str::slug($validated['name']);
        $originalSlug = $slug;
        $counter = 1;
        while (Cinema::where('slug', $slug)->exists()) {
            $slug = "{$originalSlug}-{$counter}";
            $counter++;
        }

        $cinema = Cinema::create([
            ...$validated,
            'slug' => $slug,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('admin.cinemas.index')
            ->with('success', "Bioskop '{$cinema->name}' berhasil ditambahkan.");
    }

    public function update(Request $request, Cinema $cinema): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'address' => ['required', 'string'],
            'phone' => ['nullable', 'string', 'max:50'],
            'is_active' => ['boolean'],
        ]);

        $cinema->update([
            ...$validated,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('admin.cinemas.index')
            ->with('success', "Bioskop '{$cinema->name}' berhasil diperbarui.");
    }

    public function destroy(Cinema $cinema): RedirectResponse
    {
        $name = $cinema->name;
        $cinema->delete();

        return redirect()->route('admin.cinemas.index')
            ->with('success', "Bioskop '{$name}' berhasil dihapus.");
    }
}
