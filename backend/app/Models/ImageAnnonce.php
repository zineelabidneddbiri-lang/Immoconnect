<?php

namespace App\Models;

use App\Models\Annonce;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ImageAnnonce extends Model
{
    use HasFactory;

    protected $table = 'images_annonces';

    protected $fillable=[
        "annonce_id",
        "image_path",
        "ordre",
    ];

    protected $casts= [
        'created_at'=>'datetime',
        'updated_at'=>'datetime'
    ];

    public function annonce(){
        return $this->belongsTo(Annonce::class);
    }

    //keep the scopes and buisness function for later

}
