<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Annonce;

class AnnonceController extends Controller
{
    public function indexPagination(Request $request){
        $query = Annonce::with(['user', 'imageAnnonce']);
        if ($request->filled('sort')) {
            if ($request->sort === 'price_asc') {
                $query->orderBy('price', 'asc');
            } elseif ($request->sort === 'price_desc') {
                $query->orderBy('price', 'desc');
            } else {
                $query->latest();
            }
        } else {
            $query->latest();
        }

        if ($request->filled('property_type') && $request->property_type !== 'all') {
            $query->propertyType($request->property_type);
        }
        
        if ($request->filled('listing_type') && $request->listing_type !== 'all') {
            $query->listingType($request->listing_type);
        }

        if ($request->filled('city') && $request->city !== '') {
            $query->city($request->city);
        }

        if ($request->filled('rooms') && $request->rooms !== '') {
            $query->minRooms($request->rooms);
        }

        if ($request->filled('price_min')) {
            $query->where('price', '>=', $request->price_min);
        }

        if ($request->filled('price_max')) {
            $query->where('price', '<=', $request->price_max);
        }

        if ($request->filled('surface_min')) {
            $query->where('surface_area', '>=', $request->surface_min);
        }

        if ($request->filled('surface_max')) {
            $query->where('surface_area', '<=', $request->surface_max);
        }
        
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        } else if (!$request->filled('status')) {
            // Default to 'validee' for public listings
            $query->where('status', 'validee');
        }

        return response()->json([
            "status"=>"success",
            "data"=>$query->paginate(10)
        ]);
    }

    public function show(Annonce $annonce){
        return response()->json([
            "status"=>"success",
            "data"=>$annonce->load(['user', 'imageAnnonce'])
        ]);
    }

    public function store(Request $request){
        $validated = $request->validate([
            "title"=>"required|string|max:255",
            "property_type"=>"required|in:appartement,maison,terrain",
            "listing_type"=>"required|in:vente,location",
            "price"=>"required|numeric",
            "city"=>"required|string|max:255",
            "address"=>"nullable|string|max:255",
            "rooms"=>"nullable|numeric",
            "bathrooms"=>"nullable|numeric",
            "surface_area"=>"required|numeric",
            "images"=>"nullable|array",
            "images.*"=>"string"
        ]);
        $validated['user_id'] = $request->user()->id;

        $images = $request->input('images', []);

        $annonce = Annonce::create($validated);

        foreach ($images as $index => $imgData) {
            $path = $imgData;
            if (str_starts_with($imgData, 'data:image')) {
                try {
                    $imageData = explode(',', $imgData)[1];
                    $decodedData = base64_decode($imageData);
                    $extension = 'jpg';
                    if (str_contains(explode(';', $imgData)[0], 'png')) {
                        $extension = 'png';
                    }
                    $fileName = 'annonce_' . uniqid() . '.' . $extension;
                    \Illuminate\Support\Facades\Storage::disk('public')->put('annonces/' . $fileName, $decodedData);
                    $path = 'annonces/' . $fileName;
                } catch (\Exception $e) {
                    $path = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800';
                }
            }

            $annonce->imageAnnonce()->create([
                'image_path' => $path,
                'ordre' => $index + 1
            ]);
        }

        return response()->json([
            "status"=>"success",
            "data"=>$annonce->load('imageAnnonce')
        ]);
    }

    public function update(Request $request , Annonce $annonce){

        //not any user could update
        if($request->user()->id !== $annonce->user_id && $request->user()->role !=="admin"){
            return response()->json([
                "message"=>"Unauthorised"
            ],403);
        }

        $validated = $request->validate([
            "title"=>"sometimes|string|max:255",
            "property_type"=>"sometimes|in:appartement,maison,terrain",
            "listing_type"=>"sometimes|in:vente,location",
            "price"=>"sometimes|numeric",
            "city"=>"sometimes|string|max:255",
            "address"=>"nullable|string|max:255",
            "rooms"=>"nullable|numeric",
            "bathrooms"=>"nullable|numeric",
            "status"=>"sometimes|in:en_attente,validee,refusee,supprimee"
        ]);

        $annonce->update($validated);

        return response()->json([
            "status"=>"success",
            "data"=>$annonce
        ]);
    }

    public function destroy(Request $request ,Annonce $annonce){

        if($request->user()->id !== $annonce->user_id && $request->user()->role !=="admin"){
            return response()->json([
                "message"=>"Unauthorised"
            ],403);
        }

        $annonce->delete();
        return response()->json([
            "success"=>"success",
            "message"=>"annonce well deleted"
        ]);
    }

}