<!DOCTYPE html>
<html lang="en">

    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{{ getAppName() }}</title>
        <link rel="icon" href="{{ getAppFaviconUrl() }}">
        <link id="cloudpos-theme" rel="stylesheet" href="{{ asset('assets/css/cloudpos.css') }}?v=1">
    </head>

    <body class="cloudpos font-['Poppins'] antialiased">
        <div id="root"></div>
        <script src="{{ mix('js/app.js') }}"></script>
    </body>

</html>
