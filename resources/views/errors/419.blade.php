@extends('errors.layout')

@section('code', '419')
@section('heading', 'Session expired')
@section('message', 'Your session expired because the page was open too long. Reload to continue.')

@section('actions')
    <a class="btn-primary" href="{{ url()->previous() }}">Reload page</a>
    <a class="btn-ghost" href="/">Back to home</a>
@endsection
