<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Favicon -->
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48.png">
        <link rel="apple-touch-icon" sizes="192x192" href="/favicon-192.png">
        <link rel="mask-icon" href="/favicon-32.png" color="#8B0000">

        <!-- Fonts (async: never blocks first paint) -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link rel="stylesheet" href="https://fonts.bunny.net/css?family=figtree:400,500,600,700&display=swap" media="print" onload="this.media='all'">
        <noscript><link rel="stylesheet" href="https://fonts.bunny.net/css?family=figtree:400,500,600,700&display=swap"></noscript>

        <!-- Font Awesome (self-hosted: no cdnjs request, no SRI to keep in sync) -->
        <link rel="stylesheet" href="/vendor/fontawesome/css/all.min.css" media="print" onload="this.media='all'">
        <noscript><link rel="stylesheet" href="/vendor/fontawesome/css/all.min.css"></noscript>

        <!-- CSRF -->
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite('resources/js/app.jsx')
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
