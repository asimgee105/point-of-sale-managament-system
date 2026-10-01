<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ getAppName() }} - Email Verification</title>
    <link rel="icon" type="image/png" href="{{ getAppFaviconUrl() }}">
    <script src="{{ asset('assets/js/tailwindcss.js') }}"></script>
    <script src="{{ asset('assets/js/tailwind-config.js') }}"></script>
</head>

<body class="font-['Poppins'] antialiased bg-gray-50 flex items-center justify-center min-h-screen px-4">
    <div class="w-full max-w-xl">
        <!-- Logo at Top Center -->
        <div class="flex justify-center mb-8">
            <a href="{{ route('home') }}">
                <img src="{{ getAppLogoUrl() }}" alt="logo" class="h-12 xl:h-[60px] object-contain" />
            </a>
        </div>

        <!-- Card / Modal Content -->
        <div class="bg-white shadow-2xl rounded-2xl p-8 sm:p-10 text-center">
            @if($success)
                <h1 class="text-green-600 mb-6 text-[35px] font-semibold leading-snug">
                    {{ $message }}
                </h1>
            @else
                <h1 class="text-red-600 mb-6 text-[35px] font-semibold leading-snug">
                    {{ $message }}
                </h1>
            @endif

            <a href="/app/login"
                class="inline-block w-full bg-primary text-white text-base font-medium py-3 rounded-full hover:bg-white hover:text-primary border border-primary transition duration-300">
                {{ __('messages.front_web.go_to_login') }}
            </a>
        </div>
    </div>
</body>

</html>
