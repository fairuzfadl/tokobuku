<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AddressController extends Controller
{
    public function index()
    {
        return Inertia::render('Profile/Addresses', [
            'addresses' => auth()->user()->addresses,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'label'          => 'required|string|max:50',
            'recipient_name' => 'required|string|max:100',
            'phone'          => 'required|string|max:20',
            'province'       => 'required|string|max:100',
            'city'           => 'required|string|max:100',
            'district'       => 'nullable|string|max:100',
            'village'        => 'nullable|string|max:100',
            'postal_code'    => 'required|string|max:10',
            'full_address'   => 'required|string',
            'is_default'     => 'boolean',
        ]);

        if ($data['is_default'] ?? false) {
            auth()->user()->addresses()->update(['is_default' => false]);
        }

        auth()->user()->addresses()->create($data);

        return back()->with('success', 'Alamat berhasil ditambahkan.');
    }

    public function update(Request $request, Address $address)
    {
        abort_unless($address->user_id === auth()->id(), 403);
        $data = $request->validate([
            'label'          => 'required|string|max:50',
            'recipient_name' => 'required|string|max:100',
            'phone'          => 'required|string|max:20',
            'province'       => 'required|string|max:100',
            'city'           => 'required|string|max:100',
            'district'       => 'nullable|string|max:100',
            'village'        => 'nullable|string|max:100',
            'postal_code'    => 'required|string|max:10',
            'full_address'   => 'required|string',
        ]);

        $address->update($data);

        return back()->with('success', 'Alamat berhasil diperbarui.');
    }

    public function destroy(Address $address)
    {
        abort_unless($address->user_id === auth()->id(), 403);
        $address->delete();

        return back()->with('success', 'Alamat berhasil dihapus.');
    }

    public function setDefault(Address $address)
    {
        abort_unless($address->user_id === auth()->id(), 403);
        auth()->user()->addresses()->update(['is_default' => false]);
        $address->update(['is_default' => true]);

        return back()->with('success', 'Alamat utama diperbarui.');
    }
}
