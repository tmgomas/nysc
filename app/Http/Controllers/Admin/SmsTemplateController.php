<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SmsTemplate;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SmsTemplateController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $templates = SmsTemplate::all();

        return Inertia::render('Admin/SmsTemplates/Index', [
            'templates' => $templates,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'content' => 'required|string',
            'active' => 'boolean',
        ]);

        $template = SmsTemplate::findOrFail($id);
        $template->update($validated);

        return redirect()->back()->with('success', 'SMS Template updated successfully.');
    }
}
