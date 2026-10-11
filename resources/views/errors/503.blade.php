@extends('errors.layout')

@section('code', '503')
@section('heading', 'Maintenance in progress')
@section('message', 'We are performing scheduled maintenance. Please check back shortly.')

@section('actions')
    <a class="btn-primary" href="{{ request()->fullUrl() }}">Try again</a>
    <a class="btn-ghost" href="/">Back to home</a>
@endsection
