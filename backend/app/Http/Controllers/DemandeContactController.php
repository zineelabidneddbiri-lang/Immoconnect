<?php

namespace App\Http\Controllers;
use App\Models\DemandeContact;
use App\Models\User;


use Illuminate\Http\Request;


class DemandeContactController extends Controller
{
    public function indexPagination(Request $request){
        $query = DemandeContact::with('user','annonce')->latest();
        if($request->user()->role !== "admin"){
            $query->where('user_id',$request->user()->id);
        }
        return response()->json([
            "success"=>true,
            "data"=>$query->paginate(10)
        ]);
    }

    public function store(Request $request){
        
        $validated = $request->validate([
            "contact_name"=>"required|string|max:255",
            "contact_phone"=>"required|string",
            "message"=>"required|string|max:1000",
            "annonce_id"=>"required|exists:annonces,id"
        ]);
        $validated["user_id"] = $request->user()->id;
        $exists = DemandeContact::where("user_id",$request->user()->id)->where("annonce_id",$request->annonce_id)->where("status","en_attente")->exists(); 
        if($exists){
            return response()->json([
                "success"=>false,
                "message"=>"demande already sent"
            ]);
        }

        $demande = DemandeContact::create($validated);

        return response()->json([
            "success"=>true,
            "data"=>$demande,
            "message"=>"new contact request created"
        ]);
    }

    

    public function show(Request $request ,DemandeContact $demande){
        if($request->user()->role !== "admin" && $request->user()->id !== $demande->user_id ){
            return response()->json([
            "success"=>false,
            "message"=>"unauthorized user"
        ],403);
        }
        return response()->json([
            "success"=>true,
            "data"=>$demande->load('user','annonce')
        ]);
    }

    public function destroy(Request $request , DemandeContact $demande){
        if($demande->user_id !== $request->user()->id && $request->user()->role !== "admin"){
            return response()->json([
                "success"=>false,
                "message"=>"user unauthorized"
            ],403);
        };
        $demande->delete();
         return response()->json([
                "success"=>true,
                "message"=>"demande contact deleted seccesfully !"
            ]);
    }
    public function filter(Request $request){

        //$query = DemandeContact::query(); we did at firs but we are gonna add the user and annonce data just in case the front
        //needed it

        $query = DemandeContact::with(['user', 'annonce']);

        if($request->status === "en_attente"){
            $query->pending();
        }
        if($request->status ==="acceptee"){
            $query->accepted();
        }
        if($request->status === "refusee"){
            $query->refused();
        }
        if($request->user()->role === "admin"){
            if($request->is_read === "true"){
                $query->read();
            }
            if($request->is_read === "false"){
                $query->unread();
            }
            if($request->filled('admin_note') && $request->admin_note===null){
                $query->untreated();
            }
        }else{
            $query->where('user_id',$request->user()->id);
        }

        $data = $query->latest()->paginate(10);

        return response()->json([
            "success"=>true,
            "data"=>$data
        ]);
    }
}