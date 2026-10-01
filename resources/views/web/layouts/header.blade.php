<!-- <header> -->
<nav id="navbar" class="lg:py-5 py-4 sticky top-0 left-0 w-full bg-white z-10">
    <div class="container lg:px-7 px-4 mx-auto">
        <div class="flex justify-between items-center relative">
            <div class="flex items-center">
                <a href="{{ route('home') }}">
                    <img src="{{ getAppLogoUrl() }}" alt="logo" class="xl:h-[60px] xl:object-fit-contain h-12" />
                </a>
            </div>
            <div class="flex items-center gap-5 justify-end">
                <div
                    class="menu lg:flex lg:items-center lg:static absolute top-[84px] left-0 w-full lg:w-auto lg:transition-none transition-all duration-300 linear transform hidden -translate-y-5 lg:block lg:translate-y-0">
                    <div
                        class="flex lg:flex-row flex-col xl:gap-0 gap-1 lg:py-0 py-2.5 lg:items-center w-full lg:w-auto bg-white lg:shadow-none shadow-md lg:rounded-none rounded-lg">

                        <a href="{{ Route::currentRouteName() == 'home' ? '#home' : route('home') }}"
                            class="{{ Route::currentRouteName() == 'home' ? 'active' : '' }} nav-link w-fit text-black xl:text-base text-[15px] 2xl:mx-[23px] xl:mx-5 mx-3 lg:py-0 py-1 relative hover:text-primary">
                            {{ __('messages.front_web.home') }}
                        </a>

                        <a href="{{ Route::currentRouteName() == 'home' ? '#service' : route('home') . '#service' }}"
                            class="nav-link w-fit text-black xl:text-base text-[15px] 2xl:mx-[23px] xl:mx-5 mx-3 lg:py-0 py-1 relative hover:text-primary">
                            {{ __('messages.front_web.service') }}
                        </a>

                        <a href="{{ Route::currentRouteName() == 'home' ? '#pricing' : route('home') . '#pricing' }}"
                            class="nav-link w-fit text-black xl:text-base text-[15px] 2xl:mx-[23px] xl:mx-5 mx-3 lg:py-0 py-1 relative hover:text-primary">
                            {{ __('messages.front_web.pricing') }}
                        </a>

                        <a href="{{ Route::currentRouteName() == 'home' ? '#contact-us' : route('home') . '#contact-us' }}"
                            class="nav-link w-fit text-black xl:text-base text-[15px] 2xl:mx-[23px] xl:mx-5 mx-3 lg:py-0 py-1 relative hover:text-primary">
                            {{ __('messages.front_web.contact_us') }}
                        </a>

                        <a href="{{ route('faqs') }}"
                            class="{{ Route::currentRouteName() == 'faqs' ? 'active' : '' }} nav-link w-fit text-black xl:text-base text-[15px] 2xl:mx-[23px] xl:mx-5 mx-3 lg:py-0 py-1 relative hover:text-primary">
                            {{ __('messages.front_web.faqs') }}
                        </a>

                        <div class="flex items-center xl:gap-5 gap-3 xl:ps-5 sm:hidden">
                            @if (getLoginUser())
                                <a href="{{ route('app') . '/' }}"
                                    class="flex justify-center items-center xl:text-base text-sm font-medium xl:px-8 px-6 py-2.5 text-center bg-transparent text-primary border border-primary rounded-full hover:text-white hover:bg-primary focus:text-white focus:bg-primary transition duration-300 ease-out">
                                    {{ __('messages.front_web.dashboard') }}
                                </a>
                            @else
                                <a href="{{ route('app') . '/login' }}"
                                    class="flex justify-center items-center xl:text-base text-sm font-medium xl:px-8 px-6 py-2.5 text-center bg-transparent text-primary border border-primary rounded-full hover:text-white hover:bg-primary focus:text-white focus:bg-primary transition duration-300 ease-out">
                                    {{ __('messages.front_web.login') }}
                                </a>
                                <a href="{{ route('app') . '/register' }}"
                                    class="flex justify-center items-center xl:text-base text-sm font-medium xl:px-8 px-6 py-2.5 text-center bg-primary text-white border border-primary rounded-full hover:text-primary hover:bg-transparent focus:text-primary focus:bg-transparent transition duration-300 ease-out">
                                    {{ __('messages.front_web.signup') }}
                                </a>
                            @endif
                        </div>
                    </div>
                </div>
                <div class="relative">
                    <button id="languageDropdownButton" type="button"
                        class="relative w-full block 2xl:px-5 xl:px-4 lg:px-3 px-4 lg:py-5 py-2 flex items-center gap-1.5"
                        aria-haspopup="listbox" aria-expanded="true" aria-labelledby="listbox-label">

                        <span id="selectedLanguage" class="px-1">{{ __('messages.front_web.language') }}</span>
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M4.99998 6C4.82076 6 4.64156 5.92797 4.50493 5.78422L0.205142 1.25832C-0.0683806 0.970413 -0.0683806 0.503627 0.205142 0.21584C0.478554 -0.0719468 0.921935 -0.0719468 1.19548 0.21584L4.99998 4.22061L8.80451 0.21598C9.07803 -0.0718069 9.52137 -0.0718069 9.79476 0.21598C10.0684 0.503767 10.0684 0.970553 9.79476 1.25846L5.49504 5.78436C5.35834 5.92814 5.17914 6 4.99998 6Z"
                                fill="#3F3D59"></path>
                        </svg>
                    </button>
                    <ul id="languageDropdownList"
                        class="hidden z-10 w-full py-1 mt-1 overflow-auto text-xs text-sm bg-white rounded-md shadow-lg absolute sm:text-base ring-1 ring-purple-500 focus:outline-none"
                        tabindex="-1" role="listbox" aria-labelledby="listbox-label"
                        aria-activedescendant="listbox-option-3">
                        @foreach (getAllLanguages() as $language)
                            <li id="listbox-option-0"
                                class="relative py-2 pl-3 text-sm font-semibold text-gray-900 cursor-pointer hover:bg-purple-100 pr-7 language-option"
                                role="option" data-value="{{ $language->iso_code }}">
                                <div class="flex items-center">
                                    <span class="block truncate">{{ $language->name }}</span>
                                </div>
                                <span
                                    class="absolute inset-y-0 right-0 flex items-center pr-2.5 text-primary {{ $language->iso_code == getLocalLanguage() ? '' : 'hidden' }}">
                                    <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd"
                                            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                                            clip-rule="evenodd"></path>
                                    </svg>
                                </span>
                            </li>
                        @endforeach
                    </ul>
                </div>

                <div class="sm:flex items-center xl:gap-5 gap-3 xl:ps-5 hidden">
                    @if (getLoginUser())
                        <a href="{{ route('app') . '/' }}"
                            class="flex justify-center items-center xl:text-base text-sm font-medium xl:px-8 px-6 py-2.5 text-center bg-primary text-white border border-primary rounded-full hover:text-primary hover:bg-transparent focus:text-primary focus:bg-transparent transition duration-300 ease-out">
                            {{ __('messages.front_web.dashboard') }}
                        </a>
                    @else
                        <a href="{{ route('app') . '/login' }}"
                            class="flex justify-center items-center xl:text-base text-sm font-medium xl:px-8 px-6 py-2.5 text-center bg-transparent text-primary border border-primary rounded-full hover:text-white hover:bg-primary focus:text-white focus:bg-primary transition duration-300 ease-out">
                            {{ __('messages.front_web.login') }}
                        </a>
                        <a href="{{ route('app') . '/register' }}"
                            class="flex justify-center items-center xl:text-base text-sm font-medium xl:px-8 px-6 py-2.5 text-center bg-primary text-white border border-primary rounded-full hover:text-primary hover:bg-transparent focus:text-primary focus:bg-transparent transition duration-300 ease-out">
                            {{ __('messages.front_web.signup') }}
                        </a>
                    @endif
                </div>
                <div class="flex items-center lg:hidden">
                    <button
                        class="menu-button outline-none focus:outline-none transition-all duration-300 ease-in-out text-black">
                        <svg class="w-6 h-6 menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg">
                            <path class="menu-icon-path" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 6h16M4 12h16m-7 6h7"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </div>
</nav>
