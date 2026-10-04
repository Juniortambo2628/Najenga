@extends('errors.layout')

@section('code', '500')
@section('heading', 'Something went wrong')
@section('message', 'An unexpected error occurred. The problem has been logged - please try again.')

@section('actions')
    <a class="btn-primary" href="{{ request()->fullUrl() }}">Try again</a>
    <a class="btn-ghost" href="/">Back to home</a>
@endsection
