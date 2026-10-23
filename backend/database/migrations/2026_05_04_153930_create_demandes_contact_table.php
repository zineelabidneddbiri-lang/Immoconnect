<?php 
    use Illuminate\Database\Migrations\Migration;
    use Illuminate\Database\Schema\Blueprint;
    
    use Illuminate\Support\Facades\Schema;

    return new class extends Migration {
        public function up ():void {
            Schema::create('demande_contacts',function(Blueprint $table){
                $table->id();
                $table->foreignId('annonce_id')->constrained('annonces')->onDelete('cascade');
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->string('contact_name');
                $table->string('contact_phone');
                $table->text('message');
                $table->enum('status',['en_attente','acceptee','refusee'])->default('en_attente');
                $table->text('admin_note')->nullable();
                $table->boolean('is_read')->default(0);
                $table->timestamps();
            });
        }
        public function down ():void {
            Schema::dropIfExists('demandes_contact');
        } 
    }
?>

        