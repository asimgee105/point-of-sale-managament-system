@extends('web.layouts.app')
@section('title')
FAQs
@endsection
@section('content')
@if ($faqs->count() > 0)
<section class="pt-5 sm:pt-10 px-4 bg-[url('../assets/images/asked-bg.png')] bg-no-repeat bg-cover">
    <div class="container lg:px-7 px-4 lg:max-w-7xl mx-auto">
        <div class=" rounded-lg sm:rounded-[30px] overflow-hidden">
            <div class="mb-5 sm:mb-12">
                <p
                    class="text-center text-black-100 lg:text-4xl sm:text-[32px]  xs:text-[26px] text-2xl font-semibold !leading-[1.3] mb-5 sm:mb-8 lg:mb-12">
                    Frequently Asked Questions</p>
            </div>
            <div class="grid grid-cols-1 gap-4 sm:gap-6 mb-5 sm:mb-12">
                @foreach ($faqs as $faq)
                <div>
                    <div
                        class="accordion-item bg-white py-3 sm:py-4 px-3 sm:px-8 border border-sky-200 rounded-xl {{ $loop->first ? 'accordion-open' : '' }}">
                        <button class="accordion-header flex justify-between w-full items-center gap-2">
                            <span class="text-base sm:text-xl font-medium !leading-[1.3] text-start">
                                {{ $faq->title }}
                            </span>
                            <div class="icon max-h-6 sm:max-h-10 min-w-6 sm:min-w-10 max-w-6 sm:max-w-10 text-white">
                                <img src="{{ $loop->first ? asset('images/minus-square-gray.png') : asset('images/add-square-gray.png') }}"
                                    alt="{{ $loop->first ? 'minus' : 'add' }} icon" class="h-full w-full" />
                            </div>
                        </button>
                        <div
                            class="{{ $loop->first ? '' : 'hidden' }} accordion-content bg-white text-gray-100 text-sm sm:text-base font-normal  w-full !leading-snug">
                            {{ $faq->description }}
                        </div>
                    </div>
                </div>
                @endforeach
            </div>
                </div>
    </div>
</section>
@endif
@endsection
