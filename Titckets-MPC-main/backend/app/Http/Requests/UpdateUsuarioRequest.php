<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUsuarioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,' . $this->route('id'),
            'password' => 'nullable|string|min:6',
            'area_id' => 'sometimes|required|exists:areas,id',
            'rol_id' => 'sometimes|required|exists:roles,id',
            'estado' => 'nullable|in:activo,inactivo',
            'foto' => 'nullable|file|image|mimes:jpeg,jpg,png|max:2048',
            'jefe_nombre' => 'nullable|string|max:255',
            'jefe_apellido' => 'nullable|string|max:255',
            'jefe_cargo' => 'nullable|string|max:255',
            'jefe_documento' => 'nullable|string|max:50',
            'jefe_email' => 'nullable|email|max:255',
            'jefe_telefono' => 'nullable|string|max:50',
            'jefe_foto' => 'nullable|string',
            'motivo_cambio_jefe' => 'nullable|string|max:500',
        ];
    }
}
