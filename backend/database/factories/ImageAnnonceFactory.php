<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Annonce;

class ImageAnnonceFactory extends Factory
{
    public function definition(): array
    {
        return [
            'annonce_id' => Annonce::factory(),

            'image_path' => fake()->randomElement([
                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
                'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
                'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
                'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
                'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
                'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800',
                'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800',
                'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800',
                'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800',
                'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800',
            ]),

            'ordre' => fake()->numberBetween(1, 5),
        ];
    }
}