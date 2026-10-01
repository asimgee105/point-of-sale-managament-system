<?php

namespace App\Http\Controllers;

use App\Models\ContactUs;
use App\Models\Faq;
use App\Models\Feature;
use App\Models\Partner;
use App\Models\Plan;
use App\Models\Service;
use App\Models\Step;
use App\Models\Testimonial;
use App\Models\WhyChooseUs;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;

class HomeController extends AppBaseController
{
    public function index()
    {
        $services = Service::all();
        $partners = Partner::all();
        $whyChooseUs = WhyChooseUs::all();
        $testimonials = Testimonial::all();
        $faqs = Faq::latest()->limit(5)->get();
        $plans = Plan::whereNot('assign_while_register', 1)->get();
        $features = Feature::all();
        $steps = Step::all();

        return view('web.home', compact('services', 'partners', 'whyChooseUs', 'testimonials', 'faqs', 'plans', 'features', 'steps'));
    }

    public function contactUs(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required',
            'email' => 'required|email',
            'subject' => 'required',
            'message' => 'required',
        ]);

        ContactUs::create($validated);

        return $this->sendSuccess('Your inquiry has been submitted successfully.');
    }

    public function faqs()
    {
        $faqs = Faq::all();
        return view('web.faq', compact('faqs'));
    }

    public function termsAndConditions()
    {
        $faqs = Faq::all();
        return view('web.terms-conditions', compact('faqs'));
    }

    public function privacyPolicy()
    {
        $faqs = Faq::all();
        return view('web.privacy-policy', compact('faqs'));
    }

    public function returnPolicy()
    {
        $faqs = Faq::all();
        return view('web.return-policy', compact('faqs'));
    }

    public function changeLanguage(Request $request)
    {
        Session::put('locale', $request->input('languageCode'));

        return $this->sendSuccess('Language changed successfully.');
    }
}
