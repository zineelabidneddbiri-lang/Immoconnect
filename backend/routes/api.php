<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AnnonceController;
use App\Http\Controllers\FavoriController;
use App\Http\Controllers\DemandeContactController;



//Auth Public
Route::post('/register',[AuthController::class,'register']);
Route::post('/login',[AuthController::class ,'login']);

//public

Route::get('/annonces',[AnnonceController::class,'indexPagination']);
Route::get('/annonces/{annonce}',[AnnonceController::class,'show']);

//private
Route::middleware('auth:sanctum')->group(function (){

	Route::post('/logout' ,[AuthController::class , 'logout']);
	Route::post('/logout-all',[AuthController::class ,'logoutFromAll']);
	//user Routes 
	Route::get('/users',[UserController::class , 'indexPagination']);

	Route::get('/us',[UserController::class , 'index']);


	Route::get('/me',[UserController::class , 'me']);
	Route::put('/users/{user}' , [UserController::class,'update']);
	Route::delete('/users/{user}',[UserController::class,'destroy']);
	Route::get('/users/{user}/annonces',[UserController::class,'annonces']);
	Route::get('/users/{user}/favoris',[UserController::class,'favoris']);

	//public annonces Routes

	Route::post('/annonces',[AnnonceController::class,'store']);
	Route::put('/annonces/{annonce}',[AnnonceController::class,'update']);
	Route::delete('/annonces/{annonce}',[AnnonceController::class,'destroy']);

	//favoris Routes

	//Route::get('/favoris/{favoris}',[FavoriController::class , 'index']);  
	Route::post('/favoris/{annonce}',[FavoriController::class , 'store']);
	Route::delete('/favoris/{annonce}',[FavoriController::class , 'destroy']);

	//demande contact controller 

	Route::get('/demandes',[DemandeContactController::class , 'indexPagination']);
	Route::get('/demandes/filter',[DemandeContactController::class,'filter']);
	Route::get('/demandes/{demande}',[DemandeContactController::class,'show']);
	Route::post('/demandes',[DemandeContactController::class,'store']);
	Route::delete('/demandes/{demande}',[DemandeContactController::class,'destroy']);

});

