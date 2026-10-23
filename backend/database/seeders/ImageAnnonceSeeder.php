<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Models\ImageAnnonce;

class ImageAnnonceSeeder extends Seeder
{
   
    public function run(): void
    {
        ImageAnnonce::factory()->count(30)->create();
    }
}
