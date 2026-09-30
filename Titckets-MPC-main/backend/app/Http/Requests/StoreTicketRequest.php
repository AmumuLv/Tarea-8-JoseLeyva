<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'titulo' => 'required|string|max:255',
            'descripcion' => 'required|string',
            'categoria' => 'required|string|max:255',
        ];

        if ($this->user() && $this->user()?->rol?->nombre !== 'Area Usuaria') {
            $rules['area_id'] = 'required|exists:areas,id';
        } else {
            $rules['area_id'] = 'nullable|exists:areas,id';
        }

        return $rules;
    }
}
