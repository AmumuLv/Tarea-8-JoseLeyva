<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTecnicoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'alias' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:6|max:255',
            'nombres' => 'nullable|string|max:255',
            'apellidos' => 'nullable|string|max:255',
            'estado' => 'nullable|in:activo,inactivo',
        ];

        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            $tecnicoId = $this->route('tecnico');
            $tecnico = \App\Models\Tecnico::find($tecnicoId);
            $userId = $tecnico ? $tecnico->user_id : null;

            $rules['email'] = 'sometimes|required|email|max:255|unique:users,email,' . $userId;
            $rules['password'] = 'sometimes|nullable|string|min:6|max:255';
            $rules['alias'] = 'sometimes|required|string|max:255';
        }

        return $rules;
    }
}
