<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Cinema;
use App\Models\Seat;
use App\Models\Studio;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class StudioController extends Controller
{
    public function index(Request $request): Response
    {
        $cinemaId = $request->query('cinema_id');

        $studios = Studio::with('cinema')
            ->withCount('seats')
            ->when($cinemaId, fn ($q) => $q->where('cinema_id', $cinemaId))
            ->latest()
            ->paginate(12)
            ->withQueryString();

        $cinemas = Cinema::where('is_active', true)->get();

        return Inertia::render('admin/studios/index', [
            'studios' => $studios,
            'cinemas' => $cinemas,
            'filters' => ['cinema_id' => $cinemaId],
        ]);
    }

    public function show(Studio $studio): Response
    {
        $studio->load(['cinema', 'seats' => fn ($q) => $q->orderBy('row_label')->orderBy('seat_number')]);

        return Inertia::render('admin/studios/seats', [
            'studio' => $studio,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'cinema_id' => ['required', 'exists:cinemas,id'],
            'name' => ['required', 'string', 'max:100'],
            'type' => ['required', Rule::in(['regular', 'deluxe', 'imax', 'vip_premiere'])],
            'price_multiplier' => ['required', 'numeric', 'min:0.5', 'max:5.0'],
            'rows_count' => ['required', 'integer', 'min:2', 'max:15'],
            'cols_count' => ['required', 'integer', 'min:4', 'max:20'],
        ]);

        $totalSeats = $validated['rows_count'] * $validated['cols_count'];

        $studio = Studio::create([
            'cinema_id' => $validated['cinema_id'],
            'name' => $validated['name'],
            'type' => $validated['type'],
            'price_multiplier' => $validated['price_multiplier'],
            'total_seats' => $totalSeats,
        ]);

        // Auto-generate physical seats
        $rowLetters = range('A', 'Z');
        for ($r = 0; $r < $validated['rows_count']; $r++) {
            $rowLabel = $rowLetters[$r];
            $isVip = $validated['type'] === 'vip_premiere' || ($r >= $validated['rows_count'] - 2 && $validated['type'] !== 'regular');

            for ($c = 1; $c <= $validated['cols_count']; $c++) {
                Seat::create([
                    'studio_id' => $studio->id,
                    'row_label' => $rowLabel,
                    'seat_number' => $c,
                    'seat_type' => $isVip ? 'vip' : 'regular',
                    'is_active' => true,
                ]);
            }
        }

        return redirect()->route('admin.studios.index')
            ->with('success', "Studio '{$studio->name}' beserta {$totalSeats} kursi berhasil dibuat.");
    }

    public function update(Request $request, Studio $studio): RedirectResponse
    {
        $validated = $request->validate([
            'cinema_id' => ['required', 'exists:cinemas,id'],
            'name' => ['required', 'string', 'max:100'],
            'type' => ['required', Rule::in(['regular', 'deluxe', 'imax', 'vip_premiere'])],
            'price_multiplier' => ['required', 'numeric', 'min:0.5', 'max:5.0'],
        ]);

        $studio->update($validated);

        return redirect()->route('admin.studios.index')
            ->with('success', "Data Studio '{$studio->name}' berhasil diperbarui.");
    }

    public function destroy(Studio $studio): RedirectResponse
    {
        $name = $studio->name;
        $studio->delete();

        return redirect()->route('admin.studios.index')
            ->with('success', "Studio '{$name}' berhasil dihapus.");
    }

    /**
     * Toggle a specific seat's active/damaged status or type.
     */
    public function toggleSeat(Request $request, Seat $seat): RedirectResponse
    {
        $action = $request->input('action', 'active'); // 'active' or 'type'

        if ($action === 'type') {
            $newType = $seat->seat_type === 'vip' ? 'regular' : 'vip';
            $seat->update(['seat_type' => $newType]);
            $msg = "Tipe kursi {$seat->getSeatCode()} diubah menjadi {$newType}.";
        } else {
            $newActive = ! $seat->is_active;
            $seat->update(['is_active' => $newActive]);
            $msg = "Kursi {$seat->getSeatCode()} ".($newActive ? 'diaktifkan kembali.' : 'dinonaktifkan (rusak/perbaikan).');
        }

        return back()->with('success', $msg);
    }
}
