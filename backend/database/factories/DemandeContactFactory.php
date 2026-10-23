<?php

namespace Database\Factories;

use App\Models\DemandeContact;
use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;
use App\Models\Annonce;

class DemandeContactFactory extends Factory
{
    public function definition(): array
{
    return [
        'user_id' => User::factory(),
        'annonce_id' => Annonce::factory(),

        'contact_name' => fake()->name(),
        'contact_phone' => fake()->phoneNumber(),
        'message' => fake()->paragraph(3),

        'status' => fake()->randomElement([
            'en_attente',
            'acceptee',
            'refusee'
        ]),

        'admin_note' => null,
        'is_read' => false,
    ];
}
}

