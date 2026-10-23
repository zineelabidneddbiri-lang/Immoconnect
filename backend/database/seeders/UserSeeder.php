<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Models\User;

class UserSeeder extends Seeder
{
    
    public function run(): void
    {
        User::create([
            'full_name' => 'Administrateur',
            'email' => 'admin@immoconnect.com',
            'password' => bcrypt('password'),
            'phone' => '0600000000',
            'city' => 'Casablanca',
            'role' => 'admin',
            'status' => 'active',
        ]);

        User::create([
            'full_name' => 'Jean Dupont',
            'email' => 'user@immoconnect.com',
            'password' => bcrypt('password'),
            'phone' => '0611111111',
            'city' => 'Rabat',
            'role' => 'user',
            'status' => 'active',
        ]);

        User::create([
            'full_name' => 'Marc Lavoine',
            'email' => 'curateur@immoconnect.com',
            'password' => bcrypt('password'),
            'phone' => '0622222222',
            'city' => 'Marrakech',
            'role' => 'curateur',
            'status' => 'active',
        ]);

        User::factory()->count(15)->create();
    }
}
