<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;


return new class extends Migration {
    public function up():void{
        Schema::create('users',function(Blueprint $table) {
            $table->id();
            $table->string('full_name') ;
            $table->string('email')->unique();
            $table->string('password');
            $table->string('phone');
            $table->string('city')->nullable();
            $table->string('profil_picture')->nullable();
            $table->enum('role',['user','admin','curateur'])->default('user');
            $table->enum('status',['active','banned'])->default('active');
            $table->timestamp('email_verified_at')->nullable();
            $table->timestamps() ;
        });

    }
    public function down():void {
        Schema::dropIfExists('users');
    }
}
?>


 