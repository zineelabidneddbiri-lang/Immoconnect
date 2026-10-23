<?php

namespace App\Models;

use App\Models\User;
use App\Models\ImageAnnonce;
use App\Models\DemandeContact;

use Illuminate\Support\Facades\Auth;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Annonce extends Model
{

    use HasFactory;

    protected $table = 'annonces';

    protected $fillable = [
        'title',
        'property_type',
        'listing_type',
        'price',
        'city',
        'address',
        'surface_area',
        'rooms',
        'bathrooms',
        'status',
        'user_id'
    ];
    
    protected $casts = [
        "created_at"=>"datetime",
        "updated_at"=>"datetime",
        "price"=>'decimal:2',
    ];

    public function user (){
        return $this->belongsTo(User::class);
    }
    //in complex relationships (Many to Many )laravel can't guess so we have to define the picot table and its attributes .

    //Important :belongsToMany connects MAIN models, not the pivot table : the |user| has many |favorites| |annonces| 
    public function favoris(){
        return $this->belongsToMany(User::class ,
        'favoris' , 'annonce_id' ,'user_id');
    }
    public function imageAnnonce(){
        return $this->hasMany(ImageAnnonce::class);
    }
    public function demandesContact(){
        return $this->hasMany(DemandeContact::class);
    }
    //scopes

    public function scopePropertyType($query,$value){
        return $query->where('property_type',$value);
    }
    public function scopeListingType($query,$value){
        return $query->where('listing_type',$value);
    }
    public function scopeCity($query,$value){
        return $query->where('city','like',"%$value%");
    }
    public function scopeMinRooms($query , $value){
        return  $query->where('rooms','>=',$value);
    }
    public function scopeLatest($query){
        return $query->orderBy('created_at','desc');
    }
    public function scopeLiked($query,$userId){
        return $query->whereHas(
            'favoris' , function ($q) use($userId){
                $q->where('user_id',$userId);
            }
        );
    }
    //Some Accesssores 

    public function getPriceFormatedAttribute(){
        //number formal is a function that make the numer readble by humans 
        return number_format($this->price ,0 , ',' ,' ').'MAD';
    }

    public function getImagesUrlAttribute(){
        return $this->imageAnnonce->map(function ($i){
            return asset('storage/'.$i->image_path);
        });
    }
    
    public function getIsFavoritedAttribute(){
        return Auth()->check() 
        ? $this->favoris()->where('user_id',Auth()->id())->exists()
        :false ;
    } 
    public function getCreatedAtHumanAttribute(){
        return $this->created_at->diffForHumans();
    }
    //mutatorsss
       
    public function setTitleAttribute($value){
        $this->attributes['title']=ucfirst(strtolower($value));
    }
    public function setAddressAttribute($value){
        $this->attributes['address']=trim(ucwords(strtolower($value)));
    }


    //buisness models later...
}
