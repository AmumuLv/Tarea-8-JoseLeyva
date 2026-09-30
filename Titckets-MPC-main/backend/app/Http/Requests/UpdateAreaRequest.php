<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAreaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => 'sometimes|required|string|max:255|unique:areas,nombre,' . $this->route('id'),
            'descripcion' => 'nullable|string',
            'estado' => 'nullable|in:activo,inactivo',
        ];
    }
}
