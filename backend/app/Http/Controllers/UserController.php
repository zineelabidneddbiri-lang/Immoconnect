<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Annonce;
use App\Models\Favori;


use Illuminate\Http\Request;

class UserController extends Controller
{
 
    public function index()
    {
        return response()->json(User::recent()->get());
    }
        
    public function indexPagination(Request $request){
        $query = User::recent();
        if ($request->filled('search')) {
            $query->search($request->search);
        }
        $users = $query->paginate(10);
        return response()->json([
            "status"=>"success",
            "data"=>$users
        ]);
    }

    public function me(Request $request){
        return response()->json([
            "status"=>"success",
            "data"=>$request->user()
        ]);
    }    

    public function show($id){
        return response()->json([
            "status"=>"success",
            "data"=>User::findOrFail($id)
        ]);
    }

    public function update(Request $request , User $user){
    if($request->user()->id !== $user->id && $request->user()->role !== 'admin')
        {             
            return response()->json([
                "success"=>false,
                "message"=>"only user can update his info"
            ],403);
        }
        $validated = $request->validate([
            "full_name"=>"sometimes|string|max:255",
            "email"=>"sometimes|email|unique:users,email,".$user->id,
            "phone"=>"sometimes|string",
            "city"=>"sometimes|string",
            "password"=>"sometimes|min:6",
            "status"=>"sometimes|in:active,banned",
            "role"=>"sometimes|in:user,admin,curateur"
        ]);
        if(isset($validated["password"])){
            $validated["password"] = bcrypt($validated["password"]);
        }
            $user->update($validated);
            return response()->json([
                "status"=>"success",
            ]);
        
    }
    /*this is also good 
    public function destroy($id){
        $destroyed = User::findOrFail($id);
        $destroyed->delete();
        return response()->json([
            "status"=>"success",
        ]);
    }
    */
    public function destroy(User $user){
        $user->delete();
        return response()->json([
            "status"=>"success",
        ]);
    }
    /*
    this is good but because we have the relation hasMany() we could do it cleaner
    public function annonces(User $user){
        $annonces = Annonce::Where('user_id',$user->id)->get();
        return response()->json([
            "status"=>"success",
            "data"=>$annonces
        ]);
    }
    */
    /*eiiither this : |$user->annonces| gives you directly the data or |$user->annonces()->where(..)..|where you could modify
    public function annonces(User $user){
        return response()->json([
            "status"=>"success",
            "data"=>$user->annonces
        ]);
    }
    */
    public function annonces(User $user){
        $annonces = $user->annonces()->latest()->get();
        return response()->json([
            "status"=>"success",
            "data"=>$annonces
        ]);
    }
    //same with favori cuz we have a relation too

    public function favoris(User $user){
        $favoris = $user->favoris()->with('imageAnnonce')->latest('favoris.created_at')->get();
        return response()->json([
            "status"=>"success",
            "data"=>$favoris
        ]);
    }
}
//there is still work here .. waiting for the design
