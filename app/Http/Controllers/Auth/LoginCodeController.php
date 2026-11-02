<?php

namespace App\Http\Controllers\Auth;

use Okjt\Kit\Http\Controllers\LoginCodeController as KitLoginCodeController;

/** Signing in with a code sent by email (the kit's), on to where the person was going. */
class LoginCodeController extends KitLoginCodeController
{
    use SignsInToNajenga;
}
