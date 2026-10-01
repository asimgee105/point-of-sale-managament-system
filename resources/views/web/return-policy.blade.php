@extends('web.layouts.app')
@section('title')
    {{ __('messages.front_web.return_and_refund_policy') }}
@endsection
@section('content')
    <section class="pt-5 sm:pt-10 px-4 bg-[url('../assets/images/asked-bg.png')] bg-no-repeat bg-cover">
        <div class="container max-w-7xl w-full mx-auto">
            <div class=" rounded-lg sm:rounded-[30px] overflow-hidden py-5 sm:py-10 px-0 sm:px-10 lg:px-[82px]">
                <div class="mb-5 sm:mb-12">
                    <p
                        class="text-center text-black-100 lg:text-[40px] sm:text-3xl xs:text-[26px] text-2xl font-semibold !leading-[1.3] mb-5 sm:mb-8 lg:mb-12">
                        {{ __('messages.front_web.return_and_refund_policy') }}
                    </p>
                </div>
                <div class="flex flex-col gap-3 xs:gap-5 mb-5 sm:mb-12 sm:min-h-[200px]">
                    {!! getSadminSettingValue('refund_policy') !!}
                </div>
            </div>
        </div>
    </section>
@endsection
