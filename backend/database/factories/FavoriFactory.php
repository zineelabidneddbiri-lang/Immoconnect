<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;
use App\Models\Annonce;
use App\Models\Favori;

class FavoriFactory extends Factory
{
    protected $model = Favori::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'annonce_id' => Annonce::factory(),
        ];
    }
}