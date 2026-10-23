<?php

namespace App\Models;

use App\Models\Annonce;
use App\Models\User;

use Illuminate\Support\Str;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DemandeContact extends Model
{
    use HasFactory;

    protected  $fillable = [
        'annonce_id',
        'user_id',
        'contact_name',
        'contact_phone',
        'message',
        'status',
        'admin_note',
        'is_read'
    ];
    protected $casts = [
        'created_at'=>'datetime',
        'updated_at'=>'datetime'
    ];

    public function annonce(){
        return $this->belongsTo(Annonce::class);
    }
    public function user(){
        return $this->belongsTo(User::class);
    }
    //scopes: the scoops here are very very importantttt -> because here the user is contacting the owner
    public function scopePending($query){
        return $query->where('status','en_attente');
    }
    public function scopeAccepted($query){
        return $query->where('status','acceptee');
    }
    public function scopeRefused($query){
        return $query->where('status','refusee');
    }
    public function scopeLatest($query){
        return $query->orderBy('created_at','desc');
    }
    public function scopeByUser($query,$userId){
        return $query->where('user_id',$userId);
    }
    public function scopeForAnnonce($query,$annonceId){
        return $query->where('annonce_id',$annonceId);
    }
    public function scopeSearchName($query,$value){
        return $query->where('contact_name','like',"%$value%");
    }
    public function scopeUntreated($query){
        return $query->whereNull('admin_note');
    }
    public function scopeUnread($query){
        return $query->where('is_read',false);
    }
    public function scopeRead($query){
        return $query->where('is_read',true);
    }
    //accessors

    public function getCreatedAtHumanAttribute(){
        return $this->created_at->diffForHumans();
    }
    public function getStatusLabelAttribute(){
        if($this->status==='en_attente'){
            return "En Attente";
        }
        if($this->status==='acceptee') {
            return 'Acceptée';
        };
        if($this->status==="refusee"){
            return 'Refusée';
        };
        return 'Inconnue';
    }
    public function getShortMessageAttribute(){
        return Str::limit($this->message ,40);
    }

    //mutators

    public function setContactNameAttribute($value){
        $this->attributes['contact_name'] = trim(ucwords($value));
    }
    public function setContactPhoneAttribute($value){
        $this->attributes['contact_phone'] = trim('+212'.ltrim($value,'0'));
    }
    //buisness modelss for laterrr
}
