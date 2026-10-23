<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;

use Illuminate\Http\Request;

use App\Models\User;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function register(Request $request){
        $validated = $request->validate([
            "full_name"=>"required|string|max:255",
            "email"=>"required|email|unique:users,email",
            "password"=>"required|min:6",
            "phone"=>"nullable|string",
            "city"=>"nullable|string|max:100"
        ]);
        
        $validated["password"]=bcrypt($validated["password"]);

        $user = User::create($validated);
        
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            "status"=>"success",
            "message"=>"new user register",
            "token"=>$token,
            "data"=>$user
        ],201);
    }

    public function login(Request $request){
        $credentials = $request->validate([
            "email"=>"required|email",
            "password"=>"required|string"
        ]);
        if(!Auth::attempt($credentials)){
            return response()->json([
                "status"=>"fail",
                "message"=>"user does not exists"
            ]);
        }

        $user = Auth::user();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            "status"=>"success",
            "message"=>"login seccessfully",
            "token"=>$token,
            "data"=>$user
        ]);

    }

    public function logout(Request $request){
        $request->user()->currentAccessToken()->delete();
        return response()->json([
            "status"=>"success",
            "response"=>"logout seccesfully"
        ]);
    }

    //from all devices 
    public function logoutFromAll(Request $request){
        $request->user()->tokens()->delete();
        return response()->json([
            "status"=>"success",
            "response"=>"logout seccesfully from all devices"
        ]);
    }
}
