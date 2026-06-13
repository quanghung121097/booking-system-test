<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'room_id'    => ['required', 'integer', 'exists:rooms,id'],
            'user_name'  => ['required', 'string', 'max:255'],
            'start_time' => ['required', 'date', 'after:now'],
            'end_time'   => ['required', 'date', 'after:start_time'],
        ];
    }

    public function messages(): array
    {
        return [
            'end_time.after'   => 'End time must be after start time.',
            'start_time.after' => 'Start time must be in the future.',
            'room_id.exists'   => 'Selected room does not exist.',
        ];
    }
}
