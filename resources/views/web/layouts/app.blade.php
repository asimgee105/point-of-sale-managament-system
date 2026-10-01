<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>
        @hasSection('title')
            @yield('title') | {{ getAppName() }}
        @else
            {{ getAppName() }}
        @endif
    </title>
    <link rel="icon" href="{{ getAppFaviconUrl() }}">
    <link rel="stylesheet" href="{{ asset('assets/css/slick-theme.css') }}" />
    <link rel="stylesheet" href="{{ asset('assets/css/slick.css') }}" />
    <link rel="stylesheet" href="{{ asset('assets/scss/style.css') }}" />
    {{-- <link href="{{ asset('assets/css/all.min.css') }}" rel="stylesheet" /> --}}
    <script src="{{ asset('assets/js/tailwindcss.js') }}"></script>
    <script src="{{ asset('assets/js/tailwind-config.js') }}"></script>

    <link rel="stylesheet" href="{{ asset('assets/css/cloudpos.css') }}?v=1">
</head>

<body class="cloudpos font-['Poppins'] antialiased">
    @include('web.layouts.header')
    @yield('content')
    @include('web.layouts.footer')
    <script src="{{ asset('assets/js/jquery.min.js') }}"></script>
    <script src="{{ asset('assets/js/slick.min.js') }}"></script>
    <script src="{{ asset('assets/js/index.js') }}"></script>
    <script src="{{ asset('assets/js/alpine.min.js') }}" defer></script>
    <script src="{{ asset('assets/js/custom/custom.js') }}"></script>
</body>

</html>
