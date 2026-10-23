<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class Favori extends Model
{
    use HasFactory ;

    protected $fillable = [
        'annonce_id',
        'user_id'
    ];
}
