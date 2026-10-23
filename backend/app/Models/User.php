<?php

namespace App\Models;

use App\Models\Annonce;
use App\Models\Demande;
use App\Models\Favori;

use Laravel\Sanctum\HasApiTokens;        
use Illuminate\Notifications\Notifiable; 
use Illuminate\Database\Eloquent\Factories\HasFactory; 
use Illuminate\Foundation\Auth\User as Authenticatable; 

class User extends Authenticatable
{
    use HasFactory , HasApiTokens , Notifiable;

    protected $fillable =[
        'full_name',
        'email',
        'password',
        'phone',
        'city',
        'profil_picture',
        'role',
        'status'
    ];

    protected $casts=[
        'created_at'=>'datetime',
        'updated_at'=>'datetime'
    ];

    public function annonces(){
        return $this->hasMany(Annonce::class);
    }

    public function demandes (){
        return $this->hasMany(Demande::class);
    }
    public function favoris (){
        return $this->belongsToMany(Annonce::class, 'favoris', 'user_id', 'annonce_id')->withTimestamps();
    }

    //scopes 

    public function scopeCity($query , $value){
        return $query->where('city',$value);
    }
    
    public function scopeStatus($query , $value){
        return $query->where('status',$value);
    }
    public function scopeRole($query,$value){
        return $query->where('role',$value);
    }

    public function scopeSearch($query , $value){
        return $query->where('full_name', 'like', "%$value%");
    }
    public function scopeRecent($query){
        return $query->orderBy('created_at','desc');
    }

    //Accessors

    public function getIsAdminAttribute(){
        return $this->role === 'admin';
    }

    public function getIsCurateurAttribute(){
        return $this->role === 'curateur';
    }

    public function getPhotoProfilUrlAttribute(){
        return $this->profil_picture 
        ? asset('storage/'. $this->profil_picture) 
        : asset('images/default.png');
    }
    //here there is an other version of two letters we may think about 
    public function getAvatarInitialAttribute(){
        return $this->full_name 
        ? strtoupper(substr($this->full_name , 0 , 1))
        : '?';
    }

    //Mutators : changes the data before it gets stored 

    public function setFullNameAttribute($value){
        $this->attributes['full_name']= trim(ucwords(strtolower($value)));
    }
    public function setEmailAttribute($value){
        $this->attributes['email'] = trim(strtolower($value));
    }
    public function setPhoneAttribute($value){
        $this->attributes['phone'] = trim('+212'.ltrim($value,'0'));
    }
    public function setCityAttribute($value){
        $this->attributes['city'] = trim(ucwords(strtolower($value)));
    }
    /*
    this one is optionnal handeled in upload logic
    /////public function setPhotoProfilAttribute($value){
        $this->attributes['photo_profil'] = trim($value);
    }
    */
    public function setStatusAttribute($value){
        $this->attributes['status'] = trim(strtolower($value));
    }

    public function setRoleAttribute($value){
        $this->attributes['role'] = trim(strtolower($value));
    }  

    //buisness models 

    public function isAdmin(){
        return $this->role==='admin';
    }
    public function isCurateur(){
        return $this->role==='curateur';
    }
    public function isBanned(){
        return $this->status==='banned';
    }
    public function canPostAnnonce(){
        return $this->role==='user' || $this->role==='admin';
    } 
    public function ownsAnnonce($annonce){
        return $this->id === $annonce->user_id;
    }
    public function canLogin(){
        return $this->status !== 'banned';
    }
}

