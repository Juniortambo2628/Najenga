<?php

namespace App\Http\Controllers;

use App\Models\Photo;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        return Inertia::render('ClientHome', [
            'projects' => Project::where('client_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get(),
            'recentPhotos' => Photo::where('user_id', $user->id)
                ->with('project:id,name,location')
                ->orderBy('created_at', 'desc')
                ->limit(20)
                ->get()
                ->map(fn($p) => [
                    'id' => $p->id,
                    'title' => $p->title,
                    'file_path' => $p->file_path,
                    'project_name' => $p->project?->name ?? 'Untitled',
                    'project_location' => $p->project?->location ?? 'Location not set',
                    'created_at_formatted' => $p->created_at->format('M d, Y'),
                ]),
        ]);
    }
}
