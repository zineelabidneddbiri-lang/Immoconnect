<?php

namespace Database\Factories;

use App\Models\Annonce;
use Illuminate\Database\Eloquent\Factories\Factory;

use App\Models\User;

class AnnonceFactory extends Factory
{
    
    public function definition(): array
    {
        return [
            'user_id' => User::factory(), // or random user in seeder
            'title' => fake()->sentence(6),
            'property_type' => fake()->randomElement(['appartement', 'maison', 'terrain']),
            'listing_type' => fake()->randomElement(['vente', 'location']),
            'price' => fake()->numberBetween(100000, 3000000),
            'city' => fake()->city(),
            'address' => fake()->address(),
            'surface_area' => fake()->numberBetween(50, 500),
            'rooms' => fake()->numberBetween(1, 8),
            'bathrooms' => fake()->numberBetween(1, 4),
            'status' => 'en_attente',
        ];
    }
}
