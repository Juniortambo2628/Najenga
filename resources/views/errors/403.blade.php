@extends('errors.layout')

@section('code', '403')
@section('heading', 'Access denied')
@section('message', $exception->getMessage() ?: 'You do not have permission to view this page.')

@section('actions')
    <a class="btn-primary" href="/">Back to home</a>
    <a class="btn-ghost" href="{{ url()->previous() }}">Go back</a>
@endsection
