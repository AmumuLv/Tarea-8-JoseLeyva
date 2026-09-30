<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SettingsController extends Controller
{
    public function index()
    {
        $settings = Setting::all()->pluck('value', 'key')->toArray();
        return response()->json($settings);
    }

    public function update(Request $request)
    {
        $request->validate([
            'system_name' => 'sometimes|string|max:255',
            'logo' => 'nullable|file|image|mimes:jpeg,jpg,png,svg|max:2048',
        ]);

        if ($request->filled('system_name')) {
            Setting::set('system_name', $request->system_name);
        }

        if ($request->hasFile('logo')) {
            $file = $request->file('logo');
            $filename = 'logo.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/settings'), $filename);
            Setting::set('logo', 'uploads/settings/' . $filename);
        }

        if ($request->boolean('remove_logo')) {
            $currentLogo = Setting::get('logo');
            if ($currentLogo && file_exists(public_path($currentLogo))) {
                unlink(public_path($currentLogo));
            }
            Setting::set('logo', null);
        }

        return response()->json(['message' => 'Configuración actualizada correctamente']);
    }
}
