<footer class="bg-black-900 pt-10">
    <div class="container lg:px-7 px-4 mx-auto">
        <div
            class="flex justify-between items-center border-b pb-[18px] border-[#2E4E73] sm:gap-y-10 xl:gap-[100px] lg:gap-8 sm:gap-16 gap-8">
            <div>
                <div class="lg:max-w-60 w-full">
                    <a href="{{ route('home') }}"
                        class="w-full max-w-[195px] max-h-[53px] h-screen mb-[15px] block mx-auto sm:mx-0">
                        <img src="{{ getAppLogoUrl() }}" alt="images" class="xl:h-[60px] xl:object-fit-contain" />
                    </a>
                </div>
            </div>
            <div
                class="flex items-center text-center gap-3 sm:gap-5 sm:gap-x-10 lg:gap-x-[15px] flex-wrap justify-center">
                <a href="{{ route('terms-and-conditions') }}"
                    class="block text-sm sm:text-base text-white -tracking-[0.015em] !leading-tight font-normal hover:text-primary w-fit text-nowrap">
                    {{ __('messages.front_web.terms_and_conditions') }}</a>
                <a href="{{ route('privacy-policy') }}"
                    class="block text-sm sm:text-base text-white -tracking-[0.015em] !leading-tight font-normal hover:text-primary w-fit text-nowrap">
                    {{ __('messages.front_web.privacy_policy') }}</a>
                <a href="{{ route('return-policy') }}"
                    class="block text-sm sm:text-base text-white -tracking-[0.015em] !leading-tight font-normal hover:text-primary w-fit text-nowrap">
                    {{ __('messages.front_web.return_and_refund_policy') }}</a>
            </div>
        </div>
        <div class="pt-8 sm:pb-8 pb-6">
            <div class="flex justify-between items-center flex-wrap gap-x-20 gap-y-5 pb-3 text-center">
                <p class="text-sm sm:text-base text-white -tracking-[0.015em] !leading-tight font-normal">
                    {{ getSadminSettingValue('footer') }}
                </p>
                @if (getSadminSettingValue('facebook') || getSadminSettingValue('twitter') || getSadminSettingValue('linkedin'))
                    <div class="flex gap-5 lg:gap-8 xl:ms-auto xl:me-0 mx-auto items-center flex-wrap">
                        @if (getSadminSettingValue('facebook'))
                            <a href="{{ getSadminSettingValue('facebook') }}" target="_blank"
                                class="group flex transition-all duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" width="9" height="18"
                                    class="group-hover:!fill-primary fill-white-300" viewBox="0 0 9 18" fill="none">
                                    <path
                                        d="M2.5058 10.0758C2.44316 10.0758 1.06497 10.0758 0.438515 10.0758C0.104408 10.0758 0 9.95055 0 9.63732C0 8.80206 0 7.94591 0 7.11064C0 6.77653 0.12529 6.67212 0.438515 6.67212H2.5058C2.5058 6.60948 2.5058 5.39834 2.5058 4.83454C2.5058 3.99927 2.65197 3.20577 3.06961 2.47491C3.50812 1.72317 4.13457 1.22201 4.92807 0.929665C5.45012 0.74173 5.97216 0.658203 6.53596 0.658203H8.58237C8.87471 0.658203 9 0.783493 9 1.07584V3.45635C9 3.74869 8.87471 3.87398 8.58237 3.87398C8.01856 3.87398 7.45476 3.87398 6.89095 3.89486C6.32715 3.89486 6.0348 4.16632 6.0348 4.75101C6.01392 5.37746 6.0348 5.98303 6.0348 6.63036H8.45708C8.79118 6.63036 8.91647 6.75565 8.91647 7.08976V9.61644C8.91647 9.95055 8.81207 10.055 8.45708 10.055C7.70534 10.055 6.09745 10.055 6.0348 10.055V16.8624C6.0348 17.2174 5.93039 17.3427 5.55452 17.3427C4.67749 17.3427 3.82135 17.3427 2.94432 17.3427C2.63109 17.3427 2.5058 17.2174 2.5058 16.9041C2.5058 14.7116 2.5058 10.1385 2.5058 10.0758Z">
                                    </path>
                                </svg>
                            </a>
                        @endif
                        @if (getSadminSettingValue('twitter'))
                            <a href="{{ getSadminSettingValue('twitter') }}" target="_blank"
                                class="group flex transition-all duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="14"
                                    class="group-hover:!fill-primary fill-white-300" viewBox="0 0 17 14" fill="none">
                                    <path
                                        d="M17 1.72894C16.3678 2.00625 15.6942 2.19006 14.9919 2.27931C15.7144 1.84794 16.2658 1.17006 16.5251 0.353C15.8514 0.754625 15.1077 1.03831 14.3151 1.19663C13.6754 0.515563 12.7638 0.09375 11.7693 0.09375C9.83981 0.09375 8.28644 1.65988 8.28644 3.57981C8.28644 3.85606 8.30981 4.12169 8.36719 4.37456C5.46975 4.23325 2.90594 2.84456 1.18362 0.729125C0.882937 1.25081 0.706563 1.84794 0.706563 2.49075C0.706563 3.69775 1.32812 4.76769 2.25463 5.38713C1.69469 5.3765 1.14538 5.21394 0.68 4.95788C0.68 4.9685 0.68 4.98231 0.68 4.99612C0.68 6.68975 1.88806 8.0965 3.47225 8.42056C3.18856 8.49813 2.87937 8.53531 2.5585 8.53531C2.33538 8.53531 2.11012 8.52256 1.89869 8.47581C2.35025 9.856 3.63163 10.8707 5.15525 10.9036C3.9695 11.8312 2.46394 12.3901 0.834063 12.3901C0.54825 12.3901 0.274125 12.3773 0 12.3422C1.54381 13.3378 3.37344 13.9062 5.3465 13.9062C11.7597 13.9062 15.266 8.59375 15.266 3.98887C15.266 3.83481 15.2607 3.68606 15.2533 3.53838C15.9449 3.0475 16.5261 2.43444 17 1.72894Z">
                                    </path>
                                </svg>
                            </a>
                        @endif
                        @if (getSadminSettingValue('linkedin'))
                            <a href="{{ getSadminSettingValue('linkedin') }}" target="_blank"
                                class="group flex transition-all duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="16"
                                    class="group-hover:!fill-primary fill-white-300" viewBox="0 0 15 16" fill="none">
                                    <path
                                        d="M14.9963 15.4997V15.4991H15V9.98052C15 7.28081 14.4247 5.20117 11.3004 5.20117C9.79839 5.20117 8.79045 6.03378 8.37897 6.82313H8.33552V5.45321H5.37317V15.4991H8.45779V10.5247C8.45779 9.21499 8.70356 7.94853 10.3092 7.94853C11.8912 7.94853 11.9148 9.44321 11.9148 10.6087V15.4997H14.9963Z">
                                    </path>
                                    <path d="M0.223877 5.42578H3.35821V15.2765H0.223877V5.42578Z"></path>
                                    <path
                                        d="M1.79104 0.5C0.802303 0.5 0 1.29856 0 2.28269C0 3.26683 0.802303 4.08209 1.79104 4.08209C2.77979 4.08209 3.58209 3.26683 3.58209 2.28269C3.58147 1.29856 2.77916 0.5 1.79104 0.5V0.5Z">
                                    </path>
                                </svg>
                            </a>
                        @endif
                    </div>
                @endif
            </div>
        </div>
    </div>
</footer>
