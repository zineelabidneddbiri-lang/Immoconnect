<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Models\Annonce;

class AnnonceSeeder extends Seeder
{
         
    public function run(): void
    {
        // Seed 15 validated properties
        $validees = Annonce::factory()->count(15)->create(['status' => 'validee']);
        foreach ($validees as $annonce) {
            \App\Models\ImageAnnonce::factory()->count(fake()->numberBetween(2, 4))->create([
                'annonce_id' => $annonce->id
            ]);
        }
        
        // Seed 5 pending properties
        $pendings = Annonce::factory()->count(5)->create(['status' => 'en_attente']);
        foreach ($pendings as $annonce) {
            \App\Models\ImageAnnonce::factory()->count(fake()->numberBetween(2, 4))->create([
                'annonce_id' => $annonce->id
            ]);
        }
    }
}
