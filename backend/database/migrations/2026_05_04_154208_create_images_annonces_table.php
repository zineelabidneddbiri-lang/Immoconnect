<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    public function up(): void
    {
        Schema::create('images_annonces', function (Blueprint $table) {
            $table->id();
            $table->foreignId('annonce_id')->constrained('annonces')->onDelete('cascade');
            $table->string('image_path');
            $table->integer('ordre')->default(0);
            $table->timestamps() ;
        });
    }

   
    public function down(): void
    {
        Schema::dropIfExists('images_annonces');
        
    }
};
