<?php 
    use Illuminate\Database\Migrations\Migration;
    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;
    

    return new class extends Migration{
        public function up():void{
            Schema::create('annonces', function(Blueprint $table){
                $table->id() ;
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->string('title');
                $table->enum('property_type',['appartement','maison','terrain'])->default('appartement');
                $table->enum('listing_type',['vente','location'])->default('vente');
                $table->decimal('price',15,2);
                $table->string('city');
                $table->string('address')->nullable();
                $table->float('surface_area');
                $table->integer('rooms')->nullable();
                $table->integer('bathrooms')->nullable();
                $table->enum('status',['en_attente','validee','refusee','supprimee'])->default('en_attente');
                $table->timestamps();
            });
        }

        public function down():void{
            Schema::dropIfExists('annonces');
        }
    }
?>
