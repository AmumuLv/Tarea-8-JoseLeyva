<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUsuarioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'area_id' => 'nullable|exists:areas,id',
            'rol_id' => 'required|exists:roles,id',
            'estado' => 'nullable|in:activo,inactivo',
            'foto' => 'nullable|file|image|mimes:jpeg,jpg,png|max:2048',
            'jefe_nombre' => 'nullable|string|max:255',
            'jefe_apellido' => 'nullable|string|max:255',
            'jefe_cargo' => 'nullable|string|max:255',
            'jefe_documento' => 'nullable|string|max:50',
            'jefe_email' => 'nullable|email|max:255',
            'jefe_telefono' => 'nullable|string|max:50',
            'jefe_foto' => 'nullable|string',
        ];
    }
}
