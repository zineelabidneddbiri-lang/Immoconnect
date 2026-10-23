<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Models\DemandeContact;

class DemandeContactSeeder extends Seeder
{
    
    public function run(): void
    {
        DemandeContact::factory()->count(10)->create();
    }
}
