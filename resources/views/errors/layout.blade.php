<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('heading', 'Error') - {{ config('app.name', 'Najenga') }}</title>

    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">

    {{-- Deliberately no @vite: this page has to render when the build is broken. --}}
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link rel="stylesheet" href="https://fonts.bunny.net/css?family=figtree:400,500,600,700&display=swap" media="print" onload="this.media='all'">
    <noscript><link rel="stylesheet" href="https://fonts.bunny.net/css?family=figtree:400,500,600,700&display=swap"></noscript>

    <style>
        *, *::before, *::after { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; }
        body {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem 1.25rem;
            background: #000;
            color: #fff;
            font-family: Figtree, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
            -webkit-font-smoothing: antialiased;
        }
        .panel {
            width: 100%;
            max-width: 34rem;
            padding: 2.5rem 2rem;
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 1rem;
            background: linear-gradient(to bottom right,
                rgba(26, 5, 8, 0.8), rgba(18, 3, 6, 0.8), rgba(10, 1, 2, 0.8));
            backdrop-filter: blur(24px);
            text-align: center;
        }
        .code {
            font-size: 0.7rem;
            font-weight: 700;
            letter-spacing: 0.25em;
            text-transform: uppercase;
            color: #DC143C;
        }
        h1 {
            margin: 0.5rem 0 0;
            font-size: clamp(1.75rem, 6vw, 2.5rem);
            font-weight: 700;
            line-height: 1.15;
        }
        p {
            margin: 0.875rem 0 0;
            color: #9ca3af;
            font-size: 1rem;
            line-height: 1.6;
        }
        .actions {
            margin-top: 2rem;
            display: flex;
            flex-wrap: wrap;
            gap: 0.75rem;
            justify-content: center;
        }
        .actions a {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.7rem 1.5rem;
            border-radius: 9999px;
            font-size: 0.9rem;
            font-weight: 600;
            text-decoration: none;
            transition: opacity 0.2s ease;
        }
        .actions a:hover { opacity: 0.9; }
        .btn-primary {
            background: linear-gradient(to bottom right, #8B0000, #DC143C);
            color: #fff;
        }
        .btn-ghost {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: #fff;
        }
    </style>
</head>
<body>
    <main class="panel">
        <div class="code">@yield('code')</div>
        <h1>@yield('heading')</h1>
        <p>@yield('message')</p>
        <div class="actions">
            @yield('actions')
        </div>
    </main>
</body>
</html>
