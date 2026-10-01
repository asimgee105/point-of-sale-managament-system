@extends('web.layouts.app')
@section('title')
    {{ __('messages.front_web.home') }}
@endsection
@section('content')
    <section class="pb-10 pt-[59px] relative px-4 overflow-hidden" id="home">
        <div class="container lg:px-7 px-4 mx-auto">
            <div class="flex gap-x-[62px] items-center flex-col lg:flex-row gap-10 relative">
                <div class="basis-1/2 relative">
                    <div class="mb-8 sm:mb-10 lg:mb-[61px]">
                        <h1
                            class="mb-4 sm:mb-6 text-[28px] sm:text-[32px] lg:text-4xl text-black-300 font-semibold !leading-normal">
                            {{ getSadminSettingValue('hero_title') }}
                        </h1>
                        <p class="text-gray-100 text-base sm:text-lg font-normal !leading-normal">
                            {{ getSadminSettingValue('hero_description') }}</p>
                    </div>
                    <div class="flex">
                        <a href="{{ route('app') . '/register' }}"
                            class="relative px-6 sm:px-[30px] py-2 sm:py-[17px] flex items-center gap-2 justify-center text-sm sm:text-base !leading-normal font-medium text-white hover:text-primary bg-primary hover:bg-white transition-all duration-500 border border-primary rounded-full group">
                            {{ getSadminSettingValue('hero_button_title') }}
                            <svg xmlns="http://www.w3.org/2000/svg"
                                class="fill-white group-hover:fill-primary w-4 sm:w-[21px] h-3 sm:h-[15px] animate-[rightLeft_1s_ease-in-out_infinite_alternate]"
                                viewBox="0 0 21 15" fill="none">
                                <path
                                    d="M20.1682 6.85196L13.7516 0.435298C13.5787 0.26832 13.3471 0.175925 13.1068 0.178013C12.8664 0.180102 12.6365 0.276507 12.4666 0.446464C12.2966 0.616422 12.2002 0.846333 12.1981 1.08668C12.196 1.32703 12.2884 1.55858 12.4554 1.73146L17.3073 6.58338H1.18681C0.943693 6.58338 0.710535 6.67996 0.538627 6.85187C0.366719 7.02378 0.270142 7.25693 0.270142 7.50005C0.270142 7.74316 0.366719 7.97632 0.538627 8.14823C0.710535 8.32014 0.943693 8.41671 1.18681 8.41671H17.3073L12.4554 13.2686C12.3678 13.3532 12.298 13.4543 12.25 13.5662C12.2019 13.678 12.1766 13.7983 12.1756 13.92C12.1745 14.0417 12.1977 14.1624 12.2438 14.2751C12.2899 14.3877 12.358 14.4901 12.444 14.5762C12.5301 14.6622 12.6324 14.7303 12.7451 14.7764C12.8578 14.8225 12.9785 14.8457 13.1002 14.8446C13.2219 14.8436 13.3422 14.8183 13.454 14.7702C13.5658 14.7222 13.667 14.6523 13.7516 14.5648L20.1682 8.14813C20.3401 7.97623 20.4366 7.74311 20.4366 7.50005C20.4366 7.25698 20.3401 7.02387 20.1682 6.85196Z" />
                            </svg>
                        </a>
                    </div>
                </div>
                <div class="basis-1/2">
                    <div class="h-full max-h-[482px] max-w-[698px] w-full aspect-[698/482] ms-auto">
                        <img src="{{ getSadminSettingValue('hero_image') }}" alt="images"
                            class="h-full w-full object-cover" />
                    </div>
                </div>
            </div>
        </div>
    </section>

    @if ($services->count() > 0)
        <section class="relative  bg-[#f9f5ffb8]" id="service">
            <div class="absolute bottom-0  2xl:bottom-2.5 right-2 2xl:right-[91px] text-end">
                <img src="../assets/images/action-vector-1.png" alt="images" class="h-full ms-auto w-1/2 lg:w-full">
            </div>
            <div class="container lg:px-7 px-4 mx-auto relative">
                <div class="action-slider !mb-0 select-text">
                    @foreach ($services as $service)
                        <div>
                            <div
                                class="w-full sm:min-h-[430px] min-h-[365px] sm:max-w-full max-w-[300px] shadow-[0px_2.48px_28.06px_0px_#00000017] rounded-[20px] px-4 sm:px-5 py-6 sm:py-7 bg-white mx-auto">
                                <div class="pb-5">
                                    <div
                                        class="lg:w-[92px] lg:h-[92px] sm:w-[80px] sm:h-[80px] w-[60px] h-[60px] rounded-full bg-primary flex justify-center items-center mx-auto mb-4 sm:shadow-[6px_3px_0_0_#8635fd70] shadow-[5px_2px_0_0_#8635fd70]">
                                        <img src="{{ $service->icon }}" alt="feature-img"
                                            class="lg:w-12 lg:h-12 sm:w-10 sm:h-10 w-8 h-8 object-cover" />
                                    </div>
                                    <p
                                        class="text-black-300 text-xl sm:text-[22px] text-center !leading-normal font-medium line-clamp-1">
                                        {{ $service->title }}</p>
                                </div>
                                <div class="bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 pt-0.5"></div>
                                <p
                                    class="text-gray-200 font-normal text-sm sm:text-base !leading-normal text-center pt-[18px] line-clamp-8">
                                    {{ $service->description }}
                                </p>
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>
        </section>
    @endif

    <!-- trusted by technology section -->
    @if ($partners->count() > 0)
        <section class="py-10 lg:py-20">
            <div class="container mx-auto lg:px-7 px-4">
                <p class="text-2xl sm:text-3xl text-black font-medium !leading-normal mb-2.5 text-center">
                    {{ getSadminSettingValue('partner_main_title') }}</p>
                <p class="text-sm sm:text-base font-normal text-gray-800 text-center mb-[30px] sm:mb-[60px]">
                    {{ getSadminSettingValue('partner_description') }}</p>
                <div class="flex flex-wrap items-center justify-center sm:gap-16 gap-7">
                    @foreach ($partners as $partner)
                        <div class="h-[60px] w-auto rounded">
                            <img src="{{ $partner->image }}" alt="{{ $partner->name }}" class="h-full rounded" />
                        </div>
                    @endforeach
                </div>
            </div>
        </section>
    @endif

    @if ($whyChooseUs->count() > 0)
        <section class="py-10 lg:py-20 bg-[url('../assets/images/choose-bg.png')] bg-no-repeat bg-cover">
            <div class="container lg:px-7 px-4 mx-auto relative">
                <div class="text-center">
                    <h2
                        class="lg:text-4xl sm:text-[32px]  xs:text-[26px] text-2xl font-semibold lg:mb-10 sm:mb-8 mb-6 !leading-normal text-black text-center">
                        {{ __('messages.front_web.why_choose') . ' ' . getAppName() }} ?</h2>
                </div>

                <div x-data="{ tab: 1 }"
                    class="grid grid-cols-1 items-center gap-y-5 sm:gap-y-8 lg:grid-cols-12 lg:pt-0">
                    <div
                        class=" flex overflow-x-auto pb-4  lg:overflow-visible sm:pb-0 lg:col-span-5 ms-auto w-full lg:col-span-6">
                        <div
                            class="relative flex lg:justify-end gap-x-4 whitespace-nowrap px-4  sm:px-0 lg:mx-0 lg:block lg:gap-x-0 lg:gap-y-1 lg:whitespace-normal">
                            @if ($whyChooseUs->first())
                                @php $whyChooseFirst = $whyChooseUs->first(); @endphp
                                <div class="rounded-full px-3 py-1 lg:p-5">
                                    <button @click.prevent="tab =  1"
                                        class="tab-btn group w-full items-center focus:outline-none">
                                        <div class="flex items-center text-xl font-medium">
                                            <div class="w-8 h-8 mr-4 rounded-full bg-[#ede0ff] text-primary text-lg transition duration-300 ease-in-out font-medium flex items-center justify-center"
                                                :class="{
                                                    '!bg-primary !text-white': tab === 1
                                                }">
                                                1
                                            </div>
                                            <p
                                                class="sm:text-[22px] text-black-100 font-semibold !leading-normal mb-0 text-start">
                                                {{ $whyChooseFirst->title }}</p>
                                        </div>
                                        <div class="text-start lg:block hidden">
                                            <div class="hidden text-base font-medium  text-gray-100 ms-12 pt-3 !block"
                                                :class="{
                                                    '!block': tab === 1,
                                                }">
                                                {!! $whyChooseFirst->description !!}

                                            </div>
                                        </div>
                                    </button>
                                </div>
                            @endif
                            @if ($whyChooseUs->skip(1)->first())
                                @php $whyChooseSecond = $whyChooseUs->skip(1)->first(); @endphp
                                <div class="rounded-full px-3 py-1 lg:p-5">
                                    <button @click.prevent="tab =  2"
                                        class="tab-btn group w-full items-center focus:outline-none">
                                        <div class="flex items-center text-xl font-medium">
                                            <div class="w-8 h-8 mr-4 rounded-full bg-[#ede0ff] text-primary text-lg transition duration-300 ease-in-out font-medium flex items-center justify-center"
                                                :class="{
                                                    '!bg-primary !text-white': tab === 2
                                                }">
                                                2
                                            </div>
                                            <p
                                                class="sm:text-[22px] text-black-100 font-semibold !leading-normal mb-0 text-start">
                                                {{ $whyChooseSecond->title }}</p>
                                        </div>
                                        <div class="text-start lg:block hidden">
                                            <div class="hidden text-base font-medium  text-gray-100 ms-12 pt-3 !block"
                                                :class="{
                                                    '!block': tab === 2,
                                                }">
                                                {!! $whyChooseSecond->description !!}

                                            </div>
                                        </div>
                                    </button>
                                </div>
                            @endif
                            @if ($whyChooseUs->skip(2)->first())
                                @php $whyChooseThird = $whyChooseUs->skip(2)->first(); @endphp
                                <div class="rounded-full px-3 py-1 lg:p-5">
                                    <button @click.prevent="tab = 3"
                                        class="tab-btn group w-full items-center focus:outline-none">
                                        <div class="flex items-center text-xl font-medium">
                                            <div class="w-8 h-8 mr-4 rounded-full bg-[#ede0ff] text-primary text-lg transition duration-300 ease-in-out font-medium flex items-center justify-center"
                                                :class="{
                                                    '!bg-primary !text-white': tab === 3
                                                }">
                                                3
                                            </div>
                                            <p
                                                class="sm:text-[22px] text-black-100 font-semibold !leading-normal mb-0 text-start">
                                                {{ $whyChooseThird->title }}</p>
                                        </div>
                                        <div class="text-start lg:block hidden">
                                            <div class="hidden text-base font-medium  text-gray-100 ms-12 pt-3 !block"
                                                :class="{
                                                    '!block': tab === 3,
                                                }">
                                                {!! $whyChooseThird->description !!}

                                            </div>
                                        </div>
                                    </button>
                                </div>
                            @endif
                            @if ($whyChooseUs->skip(3)->first())
                                @php $whyChooseFourth = $whyChooseUs->skip(3)->first(); @endphp
                                <div class="rounded-full px-3 py-1 lg:p-5">
                                    <button @click.prevent="tab = 4"
                                        class="tab-btn group w-full items-center focus:outline-none">
                                        <div class="flex items-center text-xl font-medium">
                                            <div class="w-8 h-8 mr-4 rounded-full bg-[#ede0ff] text-primary text-lg transition duration-300 ease-in-out font-medium flex items-center justify-center"
                                                :class="{
                                                    '!bg-primary !text-white': tab === 4
                                                }">
                                                4
                                            </div>
                                            <p
                                                class="sm:text-[22px] text-black-100 font-semibold !leading-normal mb-0 text-start">
                                                {{ $whyChooseFourth->title }}</p>
                                        </div>
                                        <div class="text-start lg:block hidden">
                                            <div class="hidden text-base font-medium  text-gray-100 ms-12 pt-3 !block"
                                                :class="{
                                                    '!block': tab === 4,
                                                }">
                                                {!! $whyChooseFourth->description !!}

                                            </div>
                                        </div>
                                    </button>
                                </div>
                            @endif
                        </div>
                    </div>
                    <div class="lg:col-span-6">
                        @if ($whyChooseUs->first())
                            @php $whyChooseFirst = $whyChooseUs->first(); @endphp
                            <div x-show="tab === 1" class="md:col-span-2 step-tab">
                                <div
                                    class="lg:hidden relative mx-auto max-w-2xl sm:text-base text-sm font-medium  text-gray-100 sm:text-center mb-8">
                                    {!! $whyChooseFirst->description !!}</div>
                                <div class="h-full max-h-[414px] mx-auto aspect-[498/414]">
                                    <img src="{{ $whyChooseFirst->image }}" alt="images"
                                        class="h-full object-cover mx-auto" />
                                </div>
                            </div>
                        @endif
                        @if ($whyChooseUs->skip(1)->first())
                            @php $whyChooseSecond = $whyChooseUs->skip(1)->first(); @endphp
                            <div x-show="tab === 2" class="md:col-span-2 step-tab">
                                <div
                                    class="lg:hidden relative mx-auto max-w-2xl sm:text-base text-sm font-medium  text-gray-100 sm:text-center mb-8">
                                    {!! $whyChooseSecond->description !!}</div>
                                <div class="h-full max-h-[414px] mx-auto aspect-[498/414]">
                                    <img src="{{ $whyChooseSecond->image }}" alt="images"
                                        class="h-full object-cover mx-auto" />
                                </div>
                            </div>
                        @endif
                        @if ($whyChooseUs->skip(2)->first())
                            @php $whyChooseThird = $whyChooseUs->skip(2)->first(); @endphp
                            <div x-show="tab === 3" class="md:col-span-2 step-tab">
                                <div
                                    class="lg:hidden relative mx-auto max-w-2xl sm:text-base text-sm font-medium  text-gray-100 sm:text-center mb-8">
                                    {!! $whyChooseThird->description !!}</div>
                                <div class="h-full max-h-[414px] mx-auto aspect-[498/414]">
                                    <img src="{{ $whyChooseThird->image }}" alt="images"
                                        class="h-full object-cover mx-auto" />
                                </div>
                            </div>
                        @endif
                        @if ($whyChooseUs->skip(3)->first())
                            @php $whyChooseFourth = $whyChooseUs->skip(3)->first(); @endphp
                            <div x-show="tab === 4" class="md:col-span-2 step-tab">
                                <div
                                    class="lg:hidden relative mx-auto max-w-2xl sm:text-base text-sm font-medium  text-gray-100 sm:text-center mb-8">
                                    {!! $whyChooseFourth->description !!}</div>
                                <div class="h-full max-h-[414px] mx-auto aspect-[498/414]">
                                    <img src="{{ $whyChooseFourth->image }}" alt="images"
                                        class="h-full object-cover mx-auto" />
                                </div>
                            </div>
                        @endif

                    </div>
                </div>
            </div>
        </section>
    @endif


    <!-- start pricing section -->
    @if ($plans->isNotEmpty())
        <section class="pricing-plan-section" id="pricing">
            <div class="container">
                <div class="section-heading text-center mb-10">
                    <h2 class="d-inline-block"> {{ __("messages.plan.choose_a_plan_that's_right_for_you") }}</h2>
                </div>
                <div class="pricing-slider">
                    @foreach ($plans as $plan)
                        <div class="">
                            <div class="pricing-card h-100">
                                <div class="pricing-card-body">
                                    <div class="text-center">
                                        <h3 class="card-title text-primary">{{ $plan->name }}</h3>
                                        <div>
                                            <h2 class="price text-center fw-5 mb-30">
                                                {{ $plan->currency->symbol }} {{ $plan->price }}
                                                @if ($plan->frequency == 1)
                                                    <span class="fs-18">/ {{ __('messages.plan.weekly') }}</span>
                                                @elseif($plan->frequency == 2)
                                                    <span class="fs-18">/ {{ __('messages.plan.monthly') }}</span>
                                                @elseif($plan->frequency == 3)
                                                    <span class="fs-18">/ {{ __('messages.plan.yearly') }}</span>
                                                @elseif($plan->frequency == 4)
                                                    <span class="fs-18">/ {{ __('messages.plan.unlimited') }}</span>
                                                @endif
                                            </h2>
                                        </div>
                                    </div>
                                    <ul class="pricing-plan-list ps-xl-4 ps-lg-3 ps-md-4 ps-3">
                                        @if ($plan->trial_days > 0)
                                            <li class="active-check flex items-center">
                                                <span class="check-box">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="18" height="18" fill="#7638f9">
                                                        <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>
                                                </span>
                                                <label
                                                    class="">{{ __('messages.plan.trial_plan') . ' (' . $plan->trial_days . ' ' . __('messages.plan.days') . ')' }}</label>
                                            </li>
                                        @endif
                                        <li class="active-check flex items-center">
                                            <span class="check-box">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="18" height="18" fill="#7638f9">
                                                    <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>
                                            </span>
                                            <label
                                                class="">{{ __('messages.front_web.number_of_stores', ['stores' => $plan->no_of_stores]) }}</label>
                                        </li>
                                        <div class="all-features">
                                            @foreach (getPlanFeature($plan) as $feature => $value)
                                                <li class="{{ $value == 1 ? 'active-check' : 'unactive-check' }} flex items-center"
                                                    @if (getLoginUserLanguage() == 'ar') style="text-align: right !important" @endif>
                                                    @if (getLoginUserLanguage() == 'ar')
                                                        <span>
                                                            {{ __('messages.plan.' . $feature) }}
                                                        </span>
                                                        <span class="check-box">
                                                            <span class="check-box">
                                                                @if($value == 1)
                                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="18" height="18" fill="#7638f9">
                                                                    <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>
                                                                @else
                                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="18" height="18" fill="#e5e7eb"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
                                                                @endif
                                                            </span>
                                                        </span>
                                                    @else
                                                        <span class="check-box">
                                                            <span class="check-box">
                                                                @if($value == 1)
                                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="18" height="18" fill="#7638f9">
                                                                    <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>
                                                                @else
                                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="18" height="18" fill="#e5e7eb"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
                                                                @endif
                                                            </span>
                                                        </span>
                                                        <span>
                                                            {{ __('messages.plan.' . $feature) }}
                                                        </span>
                                                    @endif
                                                </li>
                                            @endforeach
                                        </div>
                                    </ul>
                                    <div class="d-flex text-center justify-content-center align-items-center">
                                        @if (getLoginUser())
                                            @if (getLoginUser()->hasRole('admin'))
                                                @if (getCurrentSubscription())
                                                    @if (!getCurrentSubscription()->isExpired() && getCurrentSubscription()->plan_id == $plan->id)
                                                        <a class="btn btn-success rounded-3 mx-auto w-100 mt-7" disabled>
                                                            {{ __('messages.plan.currently_active') }}</a>
                                                    @elseif(getCurrentSubscription()->isExpired() && getCurrentSubscription()->plan_id == $plan->id)
                                                        <a href="{{ route('app') . '/user/manage-subscription/upgrade' }}"
                                                            class="btn btn-primary rounded-3 mx-auto w-100 mt-7">
                                                            {{ __('messages.plan.renew_plan') }}</a>
                                                    @else
                                                        <a href="{{ route('app') . '/user/manage-subscription/upgrade' }}"
                                                            class="btn btn-primary rounded-3 mx-auto w-100 mt-7">
                                                            {{ __('messages.plan.switch_plan') }}</a>
                                                    @endif
                                                @else
                                                    <a href="{{ route('app') . '/user/manage-subscription/upgrade' }}"
                                                        class="btn btn-primary rounded-3 mx-auto w-100 mt-7">
                                                        {{ __('messages.plan.choose_plan') }}</a>
                                                @endif
                                            @endif
                                        @else
                                            <a href="{{ route('app') . '/register' }}"
                                                class="btn btn-primary rounded-3 mx-auto w-100 mt-7">
                                                {{ __('messages.plan.choose_plan') }}</a>
                                        @endif
                                    </div>
                                </div>
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>
        </section>
    @endif
    <!-- end pricing section -->

    <section class="py-10 lg:py-20">
        <div class="container lg:px-7 px-4 mx-auto">
            <div class="flex gap-5 sm:gap-10 flex-wrap lg:flex-nowrap items-center flex-col-reverse lg:flex-row">
                <div class="lg:min-w-[56%] lg:max-w-[56%] w-full">
                    <div class="tab-content">
                        @foreach ($features as $feature)
                            <div id="tab{{ $loop->index }}" class="tab-panel hidden">
                                <div
                                    class="mb-4 sm:mb-5 w-full h-full max-w-16 sm:max-w-[102px] min-h-16 sm:max-h-[102px] min-h-16 sm:min-h-[102px] bg-gradient-to-b from-primary-100 to-gray-700/40 rounded-full flex items-center justify-center">
                                    <div class="w-full h-full max-h-8 sm:max-h-[46px] max-w-8 sm:max-w-[46px]">
                                        <img src="{{ $feature->image }}" alt="{{ $feature->title }}"
                                            class="h-full w-full object-cover" />
                                    </div>
                                </div>
                                <div class="mb-4 sm:mb-6 lg:mb-[50px]">
                                    <p class="text-black text-2xl sm:text-3xl lg:text-4xl font-semibold mb-3 sm:mb-5">
                                        {{ $feature->title }}
                                    </p>
                                    <p
                                        class="text-gray-100 font-normal text-base sm:text-lg !leading-normal lg:max-w-[460px]">
                                        {{ $feature->description }}
                                    </p>
                                </div>
                                <div class="flex flex-col gap-3 sm:gap-6 lg:gap-10">
                                    @php
                                        $points = json_decode($feature->points, true) ?? [];
                                    @endphp
                                    @if (!empty($points))
                                        @foreach ($points as $point)
                                            <div class="flex items-center gap-3">
                                                <div
                                                    class="w-full max-w-5 sm:max-w-[30px] max-h-5 sm:max-h-[30px] min-h-5 sm:min-h-[30px] rounded-full flex items-center justify-center bg-primary">
                                                    <svg xmlns="http://www.w3.org/2000/svg"
                                                        class="w-2.5 sm:w-[14px] h-2.5 sm:h-3" viewBox="0 0 14 12"
                                                        fill="none">
                                                        <path d="M1 5.76033L4.75 9.72727L13 1" stroke="white"
                                                            stroke-width="2" stroke-linecap="round" />
                                                    </svg>
                                                </div>
                                                <p
                                                    class="text-base sm:text-lg lg:text-xl font-medium !leading-normal text-black">
                                                    {{ $point }}
                                                </p>
                                            </div>
                                        @endforeach
                                    @endif
                                </div>
                            </div>
                        @endforeach
                    </div>
                </div>
                <div class="w-full">
                    <div class="grid lg:grid-cols-1 sm:grid-cols-2 flex-wrap gap-6 sm:gap-[30px]" id="tabs">
                        @foreach ($features as $feature)
                            <div data-tab="tab{{ $loop->index }}"
                                class="cursor-pointer tab-button pl-2.5 pr-5 py-4 sm:py-[22px] ms-0.5 bg-gradient-to-r from-primary-100/0 to-primary/10 relative after:bg-gray-200 after:absolute after:content-[' '] after:-left-0.5 after:top-0 after:h-full after:w-1 after:rounded-full">
                                <p class="font-medium  text-lg sm:text-xl text-gray-200 !leading-normal">
                                    {{ $feature->title }}
                                </p>
                            </div>
                        @endforeach
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="relative  bg-secondary">
        <div class="container lg:px-7 px-4 mx-auto pt-10 pb-10 relative">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-24 sm:gap-5 lg:gap-10">
                @foreach ($steps as $step)
                    <div
                        class="relative after:absolute after:content-[' '] after:max-h-5 sm:after:max-w-[118px] after:w-full after:h-full after:max-w-20 after:bg-no-repeat after:bg-contain after:rotate-90 sm:after:rotate-0 {{ $loop->last ? '' : "after:bg-[url('../assets/images/setp-after.png')]"}} after:-bottom-[56px] sm:after:bottom-auto sm:after:top-5 after:right-0 after:left-0 sm:after:left-auto after:mx-auto sm:after:mx-0 sm:after:!-right-20">
                        <div
                            class="sm:shadow-[6px_3px_0_0_#8635fd70] shadow-[5px_2px_0_0_#8635fd70] w-full h-full bg-primary rounded-full max-w-[60px] sm:max-w-[84px] max-h-[60px] sm:max-h-[84px] min-h-[60px] sm:min-h-[84px] mx-auto flex items-center justify-center mb-4 sm:mb-6 lg:mb-[32px] relative after:absolute after:content-[' '] after:-right-1.5 after:top-0.5 after:h-full after:w-full after:rounded-full after:-z-[1] after:bg-primary-light">
                            <div class="max-w-7 sm:max-w-10 max-h-7 sm:max-h-10 w-full h-full">
                                <img src="{{ $step->image }}" alt="{{ $step->title }}"
                                    class="h-full w-full object-cover" />
                            </div>
                        </div>
                        <div class="max-w-[280px] w-full mx-auto">
                            <p class="text-xs text-black font-normal !leading-normal text-center mb-1 sm:mb-[15px]">
                                {{ $step->sub_title }}
                            </p>
                            <p
                                class="text-center text-black-300 font-medium text-[22px] sm:text-2xl !leading-normal mb-1 sm:mb-[15px]">
                                {{ $step->title }}
                            </p>
                            <p class="text-base sm:text-lg font-normal !leading-normal text-gray-100 text-center">
                                {{ $step->description }}
                            </p>
                        </div>
                    </div>
                @endforeach
            </div>
        </div>
    </section>


    @if ($testimonials->count() > 0)
        <section class="bg-white py-10 lg:py-20 px-4">
            <p class="lg:text-4xl sm:text-[32px]  xs:text-[26px] text-2xl font-semibold text-center">
                {{ getSadminSettingValue('testimonial_main_title') }}
            </p>
            <div class="container max-w-[1520px] w-full mx-auto px-5">
                <div class="meet-slider">
                    @foreach ($testimonials as $testimonial)
                        <div>
                            <div class="pb-10 lg:pb-[81px] pt-5 sm:pt-10">
                                <div
                                    class="bg-white rounded-[20px] shadow-[0px_0px_15px_0px_#0000001A] p-2.5 relative mx-auto max-w-[750px] min-h-[275px] w-full">
                                    <div
                                        class="w-full h-screen max-w-16 sm:max-w-[73px] max-h-10 sm:max-h-[60px] mb-1.5 ml-1">
                                        <img src="../assets/images/quote-top.png" alt="images"
                                            class="h-full w-full object-cover" />
                                    </div>
                                    <div class="max-w-[536px] w-[85%] mx-auto text-center">
                                        <p
                                            class="text-black-300 font-medium text-[20px] sm:text-[22px] lg:text-2xl  !leading-normal mb-3 sm:mb-5">
                                            {{ $testimonial->name }}</p>
                                        <p class="text-sm text-gray-100 font-normal line-clamp-3 !leading-normal">
                                            {{ $testimonial->description }}</p>
                                    </div>
                                    <div class="">
                                        <div
                                            class="absolute w-full h-full max-w-24 lg:max-w-[136px] max-h-24 lg:max-h-[136px] mx-auto rounded-full left-0 right-0 -bottom-10 lg:-bottom-[81px]">
                                            <img src="{{ $testimonial->image }}" alt="{{ $testimonial->name }}"
                                                class="h-full w-full object-cover rounded-full" />
                                        </div>
                                        <div
                                            class="w-full h-screen max-w-16 sm:max-w-[73px] max-h-10 sm:max-h-[60px] ms-auto mt-2 me-1">
                                            <img src="../assets/images/quote-bottom.png" alt="images"
                                                class="h-full w-full object-cover" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>
        </section>
    @endif

    @if ($faqs->count() > 0)
        <section class="pt-5 sm:pt-10 px-4 bg-[url('../assets/images/asked-bg.png')] bg-no-repeat bg-cover">
            <div class="container lg:px-7 px-4 lg:max-w-7xl mx-auto">
                <div class=" rounded-lg sm:rounded-[30px] overflow-hidden">
                    <div class="mb-5 sm:mb-12">
                        <p
                            class="text-center text-black-100 lg:text-4xl sm:text-[32px]  xs:text-[26px] text-2xl font-semibold !leading-[1.3] mb-5 sm:mb-8 lg:mb-12">
                            {{ __('messages.front_web.faqs_title') }}
                        </p>
                    </div>
                    <div class="grid grid-cols-1 gap-4 sm:gap-6 mb-5 sm:mb-12">
                        @foreach ($faqs as $faq)
                            <div>
                                <div
                                    class="accordion-item !bg-white py-3 sm:py-4 px-3 sm:px-8 border border-sky-200 rounded-xl {{ $loop->first ? 'accordion-open' : '' }}">
                                    <button class="accordion-header flex justify-between w-full items-center gap-2">
                                        <span class="text-base sm:text-xl font-medium !leading-[1.3] text-start">
                                            {{ $faq->title }}
                                        </span>
                                        <div
                                            class="icon max-h-6 sm:max-h-10 min-w-6 sm:min-w-10 max-w-6 sm:max-w-10 text-white">
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

                    <div class="text-center flex">
                        <a href="{{ route('faqs') }}"
                            class="text-lg sm:text-xl  font-medium !leading-[1.3] mx-auto px-5 sm:px-[30px] py-[9px] rounded-full flex items-center border-0 justify-center gap-2.5 text-primary hover:text-white bg-white hover:bg-primary transition-all duration-500 group">
                            {{ __('messages.front_web.learn_more') }}
                            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="12"
                                class="stroke-primary group-hover:stroke-white animate-[rightLeft_1s_ease-in-out_infinite_alternate]"
                                viewBox="0 0 17 12" fill="none">
                                <path d="M1 6L15 6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M11 11L16 6L11 1" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    @endif

    <section class="py-10 lg:py-20" id="contact-us">
        <div class="container mx-auto lg:px-7 px-4">
            <div class="lg:max-w-7xl grid grid-cols-1 lg:grid-cols-2 mx-auto">
                <div class="xl:pr-16 lg:pr-12 md:pr-6">
                    <div class="">
                        <h2
                            class="lg:text-4xl sm:text-[32px]  xs:text-[26px] text-2xl font-semibold lg:mb-10 sm:mb-8 mb-6 !leading-normal text-black">
                            {{ getSadminSettingValue('contact_us_main_title') }}
                        </h2>
                        <p
                            class=" mx-auto lg:mt-7 mt-5 lg:mb-14 mb-10 text-base tracking-tight font-normal text-[--text-gray]">
                            {{ getSadminSettingValue('contact_us_description') }}</p>
                    </div>
                    <div class="">
                        <div class="flex items-center gap-4 mb-7">
                            <div class="">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="24"
                                    viewBox="0 0 18 24" fill="none">
                                    <path
                                        d="M9 0C6.61392 0.00294898 4.32637 0.997261 2.63915 2.76482C0.951939 4.53238 0.0028245 6.92886 9.57508e-06 9.42857C-0.00284824 11.4713 0.634084 13.4587 1.8131 15.0857C1.8131 15.0857 2.05855 15.4243 2.09864 15.4731L9 24L15.9046 15.4689C15.9406 15.4234 16.1869 15.0857 16.1869 15.0857L16.1877 15.0831C17.3661 13.4568 18.0028 11.4704 18 9.42857C17.9972 6.92886 17.0481 4.53238 15.3608 2.76482C13.6736 0.997261 11.3861 0.00294898 9 0ZM9 12.8571C8.35272 12.8571 7.71997 12.6561 7.18177 12.2793C6.64358 11.9026 6.2241 11.3671 5.9764 10.7406C5.72869 10.1141 5.66388 9.42477 5.79016 8.75969C5.91644 8.09461 6.22814 7.4837 6.68583 7.00421C7.14353 6.52471 7.72668 6.19817 8.36152 6.06588C8.99637 5.93359 9.6544 6.00148 10.2524 6.26098C10.8504 6.52048 11.3616 6.95993 11.7212 7.52376C12.0808 8.08759 12.2727 8.75046 12.2727 9.42857C12.2716 10.3375 11.9265 11.2089 11.313 11.8517C10.6994 12.4944 9.86765 12.856 9 12.8571Z"
                                        fill="#8635fd" />
                                </svg>

                            </div>
                            <p class="text-base  font-normal"> {{ getSadminSettingValue('address') }}</p>
                        </div>
                        <div class="flex items-center gap-4 mb-7">
                            <div class="">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
                                    viewBox="0 0 18 18" fill="none">
                                    <path
                                        d="M3 0C2.20435 0 1.44129 0.31607 0.87868 0.87868C0.31607 1.44129 0 2.20435 0 3L0 5.4C0 12.3588 5.6412 18 12.6 18H15C15.7957 18 16.5587 17.6839 17.1213 17.1213C17.6839 16.5587 18 15.7957 18 15V13.3416C18 13.0071 17.9068 12.6793 17.7309 12.3949C17.5549 12.1104 17.3032 11.8806 17.004 11.7312L14.106 10.2816C13.8753 10.1663 13.6224 10.1018 13.3647 10.0927C13.1069 10.0836 12.8501 10.13 12.6118 10.2288C12.3735 10.3276 12.1593 10.4764 11.9835 10.6652C11.8078 10.8541 11.6747 11.0784 11.5932 11.3232L11.2356 12.3948C11.1698 12.5915 11.0345 12.7574 10.8551 12.8614C10.6758 12.9655 10.4646 13.0005 10.2612 12.96C8.9729 12.7023 7.78967 12.0691 6.86056 11.1402C5.93144 10.2113 5.29799 9.02824 5.04 7.74C4.99949 7.53662 5.03454 7.32545 5.13859 7.14607C5.24264 6.96669 5.40855 6.83141 5.6052 6.7656L6.936 6.3216C7.36607 6.17799 7.7261 5.87735 7.94412 5.4798C8.16214 5.08224 8.2221 4.61705 8.112 4.1772L7.4088 1.3644C7.31168 0.975022 7.08723 0.629264 6.77111 0.382058C6.45498 0.134853 6.06531 0.000378443 5.664 0L3 0Z"
                                        fill="#8635fd" />
                                </svg>
                            </div>
                            <a href="tel:{{ getSadminSettingValue('phone') }}" class="text-base
                             font-normal">
                                {{ getSadminSettingValue('phone') }}</a>
                        </div>
                        <div class="flex items-center gap-4 mb-7">
                            <div class="">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="16"
                                    viewBox="0 0 20 16" fill="none">
                                    <path
                                        d="M2 16C1.45 16 0.979333 15.8043 0.588 15.413C0.196 15.021 0 14.55 0 14V2C0 1.45 0.196 0.979333 0.588 0.588C0.979333 0.196 1.45 0 2 0H18C18.55 0 19.021 0.196 19.413 0.588C19.8043 0.979333 20 1.45 20 2V14C20 14.55 19.8043 15.021 19.413 15.413C19.021 15.8043 18.55 16 18 16H2ZM10 8.825C10.0833 8.825 10.1707 8.81233 10.262 8.787C10.354 8.76233 10.4417 8.725 10.525 8.675L17.6 4.25C17.7333 4.16667 17.8333 4.06267 17.9 3.938C17.9667 3.81267 18 3.675 18 3.525C18 3.19167 17.8583 2.94167 17.575 2.775C17.2917 2.60833 17 2.61667 16.7 2.8L10 7L3.3 2.8C3 2.61667 2.70833 2.61233 2.425 2.787C2.14167 2.96233 2 3.20833 2 3.525C2 3.69167 2.03333 3.83733 2.1 3.962C2.16667 4.08733 2.26667 4.18333 2.4 4.25L9.475 8.675C9.55833 8.725 9.646 8.76233 9.738 8.787C9.82933 8.81233 9.91667 8.825 10 8.825Z"
                                        fill="#8635fd" />
                                </svg>
                            </div>
                            <a href="mailto:{{ getSadminSettingValue('email') }}" class="text-base  font-normal">
                                {{ getSadminSettingValue('email') }}</a>
                        </div>
                    </div>
                </div>
                <div class="p-6 rounded-[20px] shadow-[0px_0px_15px_0px_#0000001A]">
                    <form action="{{ route('contact-us') }}" method="POST" id="contactForm">
                        <div class="error-msg d-none px-4 py-3 mb-4 text-sm text-red-800 rounded-lg bg-red-50"
                            role="alert">
                        </div>
                        <div class="success-msg d-none px-4 py-3 mb-4 text-sm text-green-800 rounded-lg bg-green-50"
                            role="alert">
                        </div>
                        @csrf
                        <div>
                            <div class="grid sm:grid-cols-2 gap-3 sm:gap-4 mb-3 lg:mb-[26px]">
                                <div>
                                    <span
                                        class="text-sm text-gray-100 font-medium required  after:relative after:text-[#ff0000]  after:content-['*']">
                                        {{ __('messages.front_web.first_name') }}</span>
                                    <input name="name" type="text"
                                        class="focus:!outline-none text-sm sm:text-base text-dark-200 placeholder:text-dark-200 font-normal rounded-[10px] py-3 lg:py-[18px] px-3 lg:px-5 !leading-normal w-full bg-white-100"
                                        placeholder="{{ __('messages.front_web.enter_your_name') }}" required />
                                </div>
                                <div>
                                    <span
                                        class="text-sm text-gray-100 font-medium required  after:relative after:text-[#ff0000]  after:content-['*']">
                                        {{ __('messages.front_web.email_address') }}
                                    </span>
                                    <input name="email" type="email"
                                        class="focus:!outline-none text-sm sm:text-base text-dark-200 placeholder:text-dark-200 font-normal rounded-[10px] py-3 lg:py-[18px] px-3 sm:px-5 !leading-normal w-full bg-white-100"
                                        placeholder="{{ __('messages.front_web.enter_your_email') }}" required />
                                </div>

                            </div>
                            <div class="mb-3 lg:mb-[26px]">
                                <span
                                    class="text-sm text-gray-100 font-medium required  after:relative after:text-[#ff0000]  after:content-['*']">{{ __('messages.front_web.subject') }}</span>
                                <input name="subject" type="text"
                                    class="focus:!outline-none text-sm sm:text-base text-dark-200 placeholder:text-dark-200 font-normal rounded-[10px] py-3 lg:py-[18px] px-3 lg:px-5 !leading-normal w-full bg-white-100"
                                    placeholder="{{ __('messages.front_web.subject') }}" required />
                            </div>
                            <div class="mb-5">
                                <span
                                    class="text-sm text-gray-100 font-medium required  after:relative after:text-[#ff0000]  after:content-['*']">{{ __('messages.front_web.message') }}</span>
                                <textarea name="message" required
                                    class="block focus:!outline-none min-h-[120px] h-full focus:!outline-none  text-sm sm:text-base text-dark-200 placeholder:text-dark-200 font-normal rounded-[10px] py-3 lg:py-[18px] px-3 lg:px-5 !leading-normal w-full bg-white-100 w-full"
                                    placeholder="{{ __('messages.front_web.enter_your_message') }}"></textarea>
                            </div>
                            <div class="w-full flex items-center justify-center">
                                <button
                                    class="font-medium text-sm sm:text-base text-white hover:text-primary bg-primary hover:bg-white border border-primary transition-all duration-500 rounded-full !leading-medium py-2 sm:py-[17px] px-10 lg:px-[82px] mx-auto"
                                    type="submit"
                                    id="contactSubmitBtn">{{ __('messages.front_web.send_message') }}</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </section>
@endsection
