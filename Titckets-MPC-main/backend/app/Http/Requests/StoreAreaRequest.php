<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAreaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => 'required|string|max:255|unique:areas,nombre',
            'descripcion' => 'nullable|string',
            'estado' => 'nullable|in:activo,inactivo',
        ];
    }
}
