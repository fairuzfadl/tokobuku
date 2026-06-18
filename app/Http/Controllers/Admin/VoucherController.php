<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\Voucher;
use Illuminate\Http\Request;
use Inertia\Inertia;
class VoucherController extends Controller {
    public function index() { return Inertia::render('Admin/Vouchers/Index', ['vouchers'=>Voucher::withCount('usages')->latest()->get()]); }
    public function store(Request $request) { Voucher::create($request->validate(['code'=>'required|string|max:30|unique:vouchers','type'=>'required|in:percent,fixed','value'=>'required|numeric|min:0','min_order'=>'nullable|numeric|min:0','max_discount'=>'nullable|numeric|min:0','max_uses'=>'nullable|integer|min:1','starts_at'=>'required|date','expires_at'=>'required|date|after:starts_at','is_active'=>'boolean'])); return back()->with('success','Voucher ditambahkan.'); }
    public function update(Request $request, Voucher $voucher) {
        $voucher->update($request->validate([
            'code'         => 'required|string|max:30|unique:vouchers,code,' . $voucher->id,
            'type'         => 'required|in:percent,fixed',
            'value'        => 'required|numeric|min:0',
            'min_order'    => 'nullable|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'max_uses'     => 'nullable|integer|min:1',
            'starts_at'    => 'required|date',
            'expires_at'   => 'required|date|after:starts_at',
            'is_active'    => 'boolean',
        ]));
        return back()->with('success', 'Voucher diperbarui.');
    }
    public function toggleActive(Voucher $voucher) {
        $voucher->update(['is_active' => !$voucher->is_active]);
        return back()->with('success', 'Status voucher diperbarui.');
    }

    public function destroy(Voucher $voucher) { $voucher->delete(); return back()->with('success','Voucher dihapus.'); }
}
