<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'titulo' => 'sometimes|required|string|max:255',
            'descripcion' => 'sometimes|required|string',
            'categoria' => 'sometimes|required|string|max:255',
            'area_id' => 'sometimes|required|exists:areas,id',
        ];
    }
}
